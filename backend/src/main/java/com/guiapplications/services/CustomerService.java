package com.guiapplications.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.guiapplications.entities.Customer;
import com.guiapplications.entities.Sale;
import com.guiapplications.entities.SaleItem;
import com.guiapplications.entities.SalePayment;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CustomerPurchaseItemDTO;
import com.guiapplications.entities.dto.CustomerRequestDTO;
import com.guiapplications.entities.dto.CustomerResponseDTO;
import com.guiapplications.entities.dto.CustomerSummaryDTO;
import com.guiapplications.entities.dto.SalePaymentDTO;
import com.guiapplications.enums.SaleStatus;
import com.guiapplications.exceptions.ResourceAlreadyExistsException;
import com.guiapplications.exceptions.ResourceInUseException;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.Transactional;
import jakarta.validation.ConstraintViolationException;

// Service class for managing Customer operations
@ApplicationScoped
public class CustomerService {

    // create a Customer
    @Transactional
    public CustomerResponseDTO create(CustomerRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        String trimmedName = dto.name().trim();

        // check if a customer with the same name already exists for this user
        Customer existing = Customer.findByNameAndUser(trimmedName, user);
        if (existing != null) {
            throw new ResourceAlreadyExistsException("Já existe um cliente cadastrado com o nome: " + trimmedName);
        }

        Customer customer = new Customer();
        customer.name = trimmedName;
        customer.user = user;
        customer.persist();
        return CustomerResponseDTO.fromEntity(customer, true);
    }

    // list all customers for user (optimized with single bulk count query)
    public List<CustomerResponseDTO> listAll(User user) {
        if (user == null) return List.of();
        List<Customer> customers = Customer.listByUser(user);
        if (customers.isEmpty()) return List.of();

        List<Object[]> counts = Sale.getEntityManager()
                .createQuery("SELECT s.customer.id, COUNT(s) FROM Sale s WHERE s.user = :user GROUP BY s.customer.id", Object[].class)
                .setParameter("user", user)
                .getResultList();

        Map<UUID, Long> saleCountsMap = new HashMap<>();
        for (Object[] row : counts) {
            if (row[0] != null) {
                saleCountsMap.put((UUID) row[0], (Long) row[1]);
            }
        }

        return customers.stream()
                .map(c -> {
                    long saleCount = saleCountsMap.getOrDefault(c.id, 0L);
                    return CustomerResponseDTO.fromEntity(c, saleCount == 0);
                })
                .toList();
    }

    // search customers by name
    public List<CustomerResponseDTO> search(String name, User user) {
        if (user == null) return List.of();
        Customer customer = Customer.findByNameAndUser(name, user);
        if (customer == null) {
            return List.of();
        }
        long saleCount = Sale.count("customer", customer);
        return List.of(CustomerResponseDTO.fromEntity(customer, saleCount == 0));
    }

    // update a customer
    @Transactional
    public CustomerResponseDTO update(UUID id, CustomerRequestDTO dto) {
        Customer customer = Customer.findById(id);
        if (customer == null) {
            throw new ResourceNotFoundException("Cliente com ID " + id + " não encontrado.");
        }

        String trimmedName = dto.name().trim();

        if (customer.user != null) {
            long duplicateCount = Customer.count(
                "unaccent(LOWER(name)) = unaccent(LOWER(?1)) AND id != ?2 AND user = ?3",
                trimmedName, id, customer.user
            );
            if (duplicateCount > 0) {
                throw new ResourceAlreadyExistsException("Já existe outro cliente cadastrado com o nome: " + trimmedName);
            }
        }

        customer.name = trimmedName;
        long saleCount = Sale.count("customer", customer);
        return CustomerResponseDTO.fromEntity(customer, saleCount == 0);
    }

    // delete customer by id
    @Transactional
    public void delete(UUID id) {
        Customer customer = Customer.findById(id);
        if (customer == null) {
            throw new ResourceNotFoundException("Cliente com ID " + id + " não foi encontrado.");
        }
        try {
            customer.delete();
            Customer.flush();
        } catch (ConstraintViolationException | PersistenceException e) {
            throw new ResourceInUseException("Não é possível excluir o cliente " + customer.name + " pois existem vendas associadas a ele.");
        }
    }

    // get summary of purchases, paid amount and remaining balance for a customer (optimized with JOIN FETCH and payment tracking)
    public CustomerSummaryDTO getCustomerSummary(UUID customerId, User user) {
        Customer customer = Customer.findById(customerId);
        if (customer == null) {
            throw new ResourceNotFoundException("Cliente não encontrado com o ID: " + customerId);
        }

        List<Sale> sales = Sale.getEntityManager()
                .createQuery(
                    "SELECT DISTINCT s FROM Sale s " +
                    "LEFT JOIN FETCH s.items i " +
                    "LEFT JOIN FETCH i.product " +
                    "WHERE s.customer = :customer " +
                    "ORDER BY s.saleDate DESC",
                    Sale.class
                )
                .setParameter("customer", customer)
                .getResultList();

        List<SalePayment> allPayments = SalePayment.getEntityManager()
                .createQuery(
                    "SELECT p FROM SalePayment p WHERE p.sale.customer = :customer ORDER BY p.paymentDate ASC",
                    SalePayment.class
                )
                .setParameter("customer", customer)
                .getResultList();

        Map<UUID, List<SalePayment>> paymentsMap = new HashMap<>();
        for (SalePayment p : allPayments) {
            if (p.sale != null) {
                paymentsMap.computeIfAbsent(p.sale.id, k -> new ArrayList<>()).add(p);
            }
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        List<CustomerPurchaseItemDTO> items = new ArrayList<>();

        for (Sale sale : sales) {
            BigDecimal saleTotal = BigDecimal.ZERO;
            String productName = "Produto não informado";
            Integer quantity = 0;
            BigDecimal unitPrice = BigDecimal.ZERO;

            if (sale.items != null && !sale.items.isEmpty()) {
                SaleItem firstItem = sale.items.get(0);
                if (firstItem.productName != null && !firstItem.productName.isBlank()) {
                    productName = firstItem.productName;
                } else if (firstItem.product != null && firstItem.product.name != null) {
                    productName = firstItem.product.name;
                } else {
                    productName = "Produto indisponível";
                }
                quantity = firstItem.quantity;
                unitPrice = firstItem.sellingPrice;

                for (SaleItem item : sale.items) {
                    saleTotal = saleTotal.add(item.getTotalAmount());
                }
            }

            BigDecimal amountPaid = sale.amountPaid != null ? sale.amountPaid : BigDecimal.ZERO;
            SaleStatus saleStatus = sale.status != null ? sale.status : SaleStatus.PAID;

            if (sale.amountPaid == null && saleStatus == SaleStatus.PAID) {
                amountPaid = saleTotal;
            }

            BigDecimal remainingAmount = saleTotal.subtract(amountPaid);
            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
                remainingAmount = BigDecimal.ZERO;
            }

            totalAmount = totalAmount.add(saleTotal);
            totalPaid = totalPaid.add(amountPaid);

            String statusStr = saleStatus.name();
            String statusDesc = saleStatus.getDescription();

            // Fetch payment installment history for this sale (from bulk payments map)
            List<SalePayment> paymentsList = paymentsMap.getOrDefault(sale.id, List.of());
            BigDecimal paymentsSum = BigDecimal.ZERO;

            if (paymentsList != null) {
                for (SalePayment p : paymentsList) {
                    paymentsSum = paymentsSum.add(p.amount);
                }
            }

            List<SalePaymentDTO> paymentDTOs = new ArrayList<>();
            BigDecimal runningPaid = BigDecimal.ZERO;

            // If overall amountPaid exceeds recorded installment entries, include initial payment made at sale date
            if (amountPaid.compareTo(paymentsSum) > 0) {
                BigDecimal initialPaymentAmount = amountPaid.subtract(paymentsSum);
                runningPaid = runningPaid.add(initialPaymentAmount);
                BigDecimal rem = saleTotal.subtract(runningPaid);
                if (rem.compareTo(BigDecimal.ZERO) < 0) rem = BigDecimal.ZERO;
                paymentDTOs.add(new SalePaymentDTO(null, sale.saleDate, initialPaymentAmount, runningPaid, rem));
            }

            if (paymentsList != null && !paymentsList.isEmpty()) {
                for (SalePayment p : paymentsList) {
                    runningPaid = runningPaid.add(p.amount);
                    BigDecimal rem = saleTotal.subtract(runningPaid);
                    if (rem.compareTo(BigDecimal.ZERO) < 0) rem = BigDecimal.ZERO;
                    paymentDTOs.add(new SalePaymentDTO(p.id, p.paymentDate, p.amount, runningPaid, rem));
                }
            }

            // Reverse payments list so the latest payment record appears first
            Collections.reverse(paymentDTOs);

            items.add(new CustomerPurchaseItemDTO(
                sale.id,
                sale.saleDate,
                productName,
                quantity,
                unitPrice,
                saleTotal,
                amountPaid,
                remainingAmount,
                statusStr,
                statusDesc,
                paymentDTOs
            ));
        }

        BigDecimal totalRemaining = totalAmount.subtract(totalPaid);
        if (totalRemaining.compareTo(BigDecimal.ZERO) < 0) {
            totalRemaining = BigDecimal.ZERO;
        }

        return new CustomerSummaryDTO(
            customer.id,
            customer.name,
            totalAmount,
            totalPaid,
            totalRemaining,
            items
        );
    }

    // Apply additional payment to customer's outstanding debts (oldest sales first) and record installment
    @Transactional
    public CustomerSummaryDTO addCustomerPayment(UUID customerId, BigDecimal additionalPayment, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        if (additionalPayment == null || additionalPayment.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do pagamento adicional deve ser maior que zero.");
        }

        Customer customer = Customer.findById(customerId);
        if (customer == null) {
            throw new ResourceNotFoundException("Cliente não encontrado com o ID: " + customerId);
        }

        List<Sale> sales = Sale.getEntityManager()
                .createQuery(
                    "SELECT DISTINCT s FROM Sale s " +
                    "LEFT JOIN FETCH s.items i " +
                    "LEFT JOIN FETCH i.product " +
                    "WHERE s.customer = :customer " +
                    "ORDER BY s.saleDate ASC",
                    Sale.class
                )
                .setParameter("customer", customer)
                .getResultList();

        BigDecimal remainingToApply = additionalPayment;
        LocalDateTime now = LocalDateTime.now();

        for (Sale sale : sales) {
            if (remainingToApply.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }

            BigDecimal saleTotal = BigDecimal.ZERO;
            if (sale.items != null && !sale.items.isEmpty()) {
                for (SaleItem item : sale.items) {
                    saleTotal = saleTotal.add(item.getTotalAmount());
                }
            }

            BigDecimal currentPaid = sale.amountPaid != null ? sale.amountPaid : (sale.status == SaleStatus.PAID ? saleTotal : BigDecimal.ZERO);
            BigDecimal debt = saleTotal.subtract(currentPaid);

            if (debt.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal paymentForSale = remainingToApply.min(debt);
                BigDecimal newPaid = currentPaid.add(paymentForSale);

                sale.amountPaid = newPaid;
                if (newPaid.compareTo(saleTotal) >= 0) {
                    sale.status = SaleStatus.PAID;
                } else {
                    sale.status = SaleStatus.PARTIALLY_PAID;
                }
                sale.persist();

                // Persist new SalePayment installment record
                SalePayment paymentRecord = new SalePayment();
                paymentRecord.sale = sale;
                paymentRecord.paymentDate = now;
                paymentRecord.amount = paymentForSale;
                paymentRecord.persist();

                remainingToApply = remainingToApply.subtract(paymentForSale);
            }
        }

        return getCustomerSummary(customerId, user);
    }
}
