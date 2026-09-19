package com.guiapplications.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.Customer;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.Sale;
import com.guiapplications.entities.SaleItem;
import com.guiapplications.entities.SalePayment;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.SaleRequestDTO;
import com.guiapplications.entities.dto.SaleResponseDTO;
import com.guiapplications.enums.SaleStatus;
import com.guiapplications.exceptions.ResourceNotFoundException;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class SaleService {

    @Transactional
    public SaleResponseDTO createSale(SaleRequestDTO dto, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }

        List<com.guiapplications.entities.dto.SaleItemRequestDTO> itemsToProcess = new ArrayList<>();
        if (dto.items() != null && !dto.items().isEmpty()) {
            itemsToProcess.addAll(dto.items());
        } else if (dto.productId() != null) {
            itemsToProcess.add(new com.guiapplications.entities.dto.SaleItemRequestDTO(
                dto.productId(), dto.batchId(), dto.quantity(), dto.sellingPrice()
            ));
        } else {
            throw new IllegalArgumentException("Nenhum item informado para a venda.");
        }

        boolean isPersonalUse = Boolean.TRUE.equals(dto.isPersonalUse());
        for (com.guiapplications.entities.dto.SaleItemRequestDTO itemDto : itemsToProcess) {
            if (itemDto.productId() == null) {
                throw new IllegalArgumentException("ID do produto é obrigatório.");
            }
            if (itemDto.quantity() == null || itemDto.quantity() <= 0) {
                throw new IllegalArgumentException("Quantidade deve ser maior que zero.");
            }
            if (!isPersonalUse && (itemDto.sellingPrice() == null || itemDto.sellingPrice().compareTo(BigDecimal.ZERO) <= 0)) {
                throw new IllegalArgumentException("Preço de venda deve ser maior que zero.");
            }
        }

        // Customer lookup or creation
        Customer customer = null;
        if (dto.customerName() != null && !dto.customerName().isBlank()) {
            String trimmedName = dto.customerName().trim();
            customer = Customer.findByNameAndUser(trimmedName, user);
            if (customer == null) {
                customer = new Customer();
                customer.name = trimmedName;
                customer.user = user;
                customer.persist();
            }
        }

        String observation = dto.observation() != null && !dto.observation().isBlank() ? dto.observation().trim() : null;

        Sale sale = new Sale();
        sale.saleDate = LocalDateTime.now();
        sale.customer = customer;
        sale.user = user;
        sale.observation = observation;
        sale.isPersonalUse = isPersonalUse;
        sale.items = new ArrayList<>();

        BigDecimal totalSaleAmount = BigDecimal.ZERO;
        BigDecimal totalSaleProfit = BigDecimal.ZERO;
        int totalSaleQuantity = 0;
        List<String> productNames = new ArrayList<>();
        UUID firstProductId = null;
        BigDecimal firstPurchasePrice = BigDecimal.ZERO;
        BigDecimal firstSellingPrice = BigDecimal.ZERO;

        for (com.guiapplications.entities.dto.SaleItemRequestDTO itemDto : itemsToProcess) {
            UUID productId = itemDto.productId();
            if (firstProductId == null) {
                firstProductId = productId;
            }

            Product product = Product.findById(productId);
            if (product == null) {
                throw new ResourceNotFoundException("Produto com ID " + productId + " não encontrado.");
            }

            List<com.guiapplications.entities.ProductBatch> existingExtraBatches =
                com.guiapplications.entities.ProductBatch.findByProductAndUser(product, user);
            int currentStock = (product.quantity != null ? product.quantity : 0)
                + existingExtraBatches.stream().mapToInt(b -> b.quantity != null ? b.quantity : 0).sum();

            if (itemDto.quantity() > currentStock) {
                throw new IllegalArgumentException(
                    "Quantidade solicitada (" + itemDto.quantity() + ") do produto \"" + product.name + "\" é maior do que o estoque disponível (" + currentStock + ")."
                );
            }

            BigDecimal unitPurchasePrice;
            BigDecimal unitSellingPrice;
            BigDecimal itemTotalAmount;

            if (isPersonalUse) {
                unitPurchasePrice = BigDecimal.ZERO;
                unitSellingPrice = BigDecimal.ZERO;
                itemTotalAmount = BigDecimal.ZERO;
            } else {
                BigDecimal rawBuy = product.purchasePrice != null ? product.purchasePrice : BigDecimal.ZERO;
                unitSellingPrice = itemDto.sellingPrice();
                if (rawBuy.compareTo(BigDecimal.ZERO) == 0 && unitSellingPrice != null && unitSellingPrice.compareTo(BigDecimal.ZERO) > 0) {
                    unitPurchasePrice = unitSellingPrice.multiply(new BigDecimal("0.70")).setScale(2, RoundingMode.HALF_UP);
                } else {
                    unitPurchasePrice = rawBuy;
                }
                itemTotalAmount = unitSellingPrice.multiply(BigDecimal.valueOf(itemDto.quantity()));
            }

            if (firstPurchasePrice.compareTo(BigDecimal.ZERO) == 0) firstPurchasePrice = unitPurchasePrice;
            if (firstSellingPrice.compareTo(BigDecimal.ZERO) == 0) firstSellingPrice = unitSellingPrice;

            SaleItem item = new SaleItem();
            item.sale = sale;
            item.product = product;
            item.productName = product.name;
            item.quantity = itemDto.quantity();
            item.purchasePrice = unitPurchasePrice;
            item.sellingPrice = unitSellingPrice;
            sale.items.add(item);

            totalSaleAmount = totalSaleAmount.add(itemTotalAmount);
            totalSaleQuantity += itemDto.quantity();
            if (!productNames.contains(product.name)) {
                productNames.add(product.name);
            }

            // 2. Deduct stock from specific batch or FEFO order
            if (itemDto.batchId() != null) {
                if (itemDto.batchId().equals(product.id)) {
                    if (!isPersonalUse && product.purchasePrice != null) {
                        unitPurchasePrice = product.purchasePrice;
                        item.purchasePrice = unitPurchasePrice;
                    }
                    product.quantity = product.quantity - itemDto.quantity();
                } else {
                    com.guiapplications.entities.ProductBatch selectedBatch =
                        com.guiapplications.entities.ProductBatch.findById(itemDto.batchId());
                    if (selectedBatch != null) {
                        if (!isPersonalUse && selectedBatch.purchasePrice != null) {
                            unitPurchasePrice = selectedBatch.purchasePrice;
                            item.purchasePrice = unitPurchasePrice;
                        }
                        selectedBatch.quantity = selectedBatch.quantity - itemDto.quantity();
                        if (selectedBatch.quantity <= 0) {
                            selectedBatch.delete();
                        } else {
                            selectedBatch.persist();
                        }
                    }
                }
            } else {
                int toDeduct = itemDto.quantity();
                List<BatchCandidate> candidates = new ArrayList<>();
                candidates.add(new BatchCandidate(product.id, true, product.quantity, product.expirationDate, product.purchaseDate));
                for (com.guiapplications.entities.ProductBatch pb : existingExtraBatches) {
                    candidates.add(new BatchCandidate(pb.id, false, pb.quantity, pb.expirationDate, pb.purchaseDate));
                }
                candidates.sort((c1, c2) -> {
                    if (c1.expDate == null && c2.expDate == null) return 0;
                    if (c1.expDate == null) return 1;
                    if (c2.expDate == null) return -1;
                    int cmp = c1.expDate.compareTo(c2.expDate);
                    if (cmp != 0) return cmp;
                    if (c1.purDate == null || c2.purDate == null) return 0;
                    return c1.purDate.compareTo(c2.purDate);
                });

                for (BatchCandidate c : candidates) {
                    if (toDeduct <= 0) break;
                    if (c.isLote1) {
                        int deduct = Math.min(product.quantity, toDeduct);
                        product.quantity -= deduct;
                        toDeduct -= deduct;
                    } else {
                        com.guiapplications.entities.ProductBatch pb = com.guiapplications.entities.ProductBatch.findById(c.id);
                        if (pb != null) {
                            int deduct = Math.min(pb.quantity, toDeduct);
                            pb.quantity -= deduct;
                            toDeduct -= deduct;
                            if (pb.quantity <= 0) {
                                pb.delete();
                            } else {
                                pb.persist();
                            }
                        }
                    }
                }
            }

            // 3. Stock promotion or deletion
            if (product.quantity <= 0) {
                List<com.guiapplications.entities.ProductBatch> remainingExtra =
                    com.guiapplications.entities.ProductBatch.findByProductAndUser(product, user);
                if (remainingExtra != null && !remainingExtra.isEmpty()) {
                    com.guiapplications.entities.ProductBatch oldestRemaining = remainingExtra.get(0);
                    product.quantity = oldestRemaining.quantity + product.quantity;
                    product.purchaseDate = oldestRemaining.purchaseDate;
                    product.expirationDate = oldestRemaining.expirationDate;
                    product.purchasePrice = oldestRemaining.purchasePrice;
                    product.sellingPrice = oldestRemaining.sellingPrice;
                    oldestRemaining.delete();
                    product.persist();
                } else {
                    item.product = null;
                    SaleItem.update("product = null WHERE product.id = ?1", productId);
                    product.delete();
                }
            } else {
                product.persist();
            }

            BigDecimal itemProfit = isPersonalUse 
                ? BigDecimal.ZERO 
                : unitSellingPrice.subtract(unitPurchasePrice).multiply(BigDecimal.valueOf(itemDto.quantity()));
            totalSaleProfit = totalSaleProfit.add(itemProfit);
        }

        BigDecimal amountPaid;
        SaleStatus status;

        if (isPersonalUse) {
            amountPaid = BigDecimal.ZERO;
            status = SaleStatus.PAID;
        } else {
            amountPaid = dto.amountPaid() != null ? dto.amountPaid() : totalSaleAmount;
            status = SaleStatus.calculate(amountPaid, totalSaleAmount);
        }

        sale.amountPaid = amountPaid;
        sale.status = status;
        sale.paymentMethod = dto.paymentMethod();
        sale.persist();

        if (!isPersonalUse && amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            SalePayment initialPayment = new SalePayment();
            initialPayment.sale = sale;
            initialPayment.paymentDate = sale.saleDate;
            initialPayment.amount = amountPaid;
            initialPayment.paymentMethod = dto.paymentMethod();
            initialPayment.persist();
        }

        BigDecimal remainingAmount = totalSaleAmount.subtract(amountPaid);
        if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
            remainingAmount = BigDecimal.ZERO;
        }

        String displayProductName = String.join("\n", productNames);

        return new SaleResponseDTO(
            sale.id,
            sale.saleDate,
            itemsToProcess.size() == 1 ? firstProductId : null,
            displayProductName,
            totalSaleQuantity,
            firstPurchasePrice,
            firstSellingPrice,
            totalSaleAmount,
            amountPaid,
            remainingAmount,
            totalSaleProfit,
            status.name(),
            status.getDescription(),
            customer != null ? customer.name : null,
            sale.observation,
            sale.isPersonalUse,
            sale.paymentMethod != null ? sale.paymentMethod.name() : null,
            sale.paymentMethod != null ? sale.paymentMethod.getDescription() : null
        );
    }

    @Transactional
    public void addSalePayment(UUID saleId, BigDecimal amount, com.guiapplications.enums.PaymentMethod paymentMethod, User user) {
        if (user == null) {
            throw new IllegalArgumentException("Sessão inválida ou expirada. Faça login novamente.");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do abatimento deve ser maior que zero.");
        }

        Sale sale = Sale.findById(saleId);
        if (sale == null) {
            throw new ResourceNotFoundException("Venda não encontrada com o ID: " + saleId);
        }

        BigDecimal saleTotal = BigDecimal.ZERO;
        if (sale.items != null) {
            for (SaleItem item : sale.items) {
                saleTotal = saleTotal.add(item.getTotalAmount());
            }
        }

        BigDecimal currentPaid = sale.amountPaid != null ? sale.amountPaid : (sale.status == SaleStatus.PAID ? saleTotal : BigDecimal.ZERO);
        BigDecimal newPaid = currentPaid.add(amount);

        sale.amountPaid = newPaid;
        sale.status = SaleStatus.calculate(newPaid, saleTotal);
        sale.persist();

        SalePayment payment = new SalePayment();
        payment.sale = sale;
        payment.paymentDate = LocalDateTime.now();
        payment.amount = amount;
        payment.paymentMethod = paymentMethod;
        payment.persist();
    }

    private record BatchCandidate(
        UUID id,
        boolean isLote1,
        int quantity,
        java.time.LocalDate expDate,
        java.time.LocalDate purDate
    ) {}
}
