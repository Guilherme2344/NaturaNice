package com.guiapplications.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

import com.guiapplications.entities.dto.DailySalesSummaryDTO;
import com.guiapplications.entities.dto.MonthlySalesSummaryDTO;
import com.guiapplications.enums.PaymentMethod;
import com.guiapplications.enums.SaleStatus;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.TypedQuery;

@Entity
@Table(name = "sales", indexes = {
    @Index(name = "idx_sale_date", columnList = "saleDate"),
    @Index(name = "idx_sale_user_id", columnList = "user_id")
})
public class Sale extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "saleDate", nullable = false)
    public LocalDateTime saleDate;

    @Column(name = "amount_paid", nullable = true, precision = 10, scale = 2, columnDefinition = "numeric(10,2) default 0.00")
    public BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = true, length = 20, columnDefinition = "varchar(20) default 'PAID'")
    public SaleStatus status = SaleStatus.PAID;

    @Column(name = "observation", length = 2000)
    public String observation;

    @Column(name = "is_personal_use", nullable = true, columnDefinition = "boolean default false")
    public Boolean isPersonalUse = false;

    @Column(name = "discount", nullable = true, precision = 10, scale = 2, columnDefinition = "numeric(10,2) default 0.00")
    public BigDecimal discount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 30)
    public PaymentMethod paymentMethod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    public Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;
    
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    public List<SaleItem> items;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    public List<SalePayment> payments;

    public BigDecimal calculateTotalProfit() {
        if (Boolean.TRUE.equals(isPersonalUse)) {
            return BigDecimal.ZERO;
        }
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (SaleItem item : items) {
            total = total.add(item.getTotalProfit());
        }
        if (discount != null && discount.compareTo(BigDecimal.ZERO) > 0) {
            total = total.subtract(discount);
        }
        return total;
    }
    
    // daily sales summary
    public static List<DailySalesSummaryDTO> getDailySummaries(LocalDateTime start, LocalDateTime end, String customerName, User user) {
        return getDailySummaries(start, end, customerName, null, user);
    }

    public static List<DailySalesSummaryDTO> getDailySummaries(LocalDateTime start, LocalDateTime end, String customerName, String status, User user) {
        if (user == null) {
            return List.of();
        }

        StringBuilder jpql = new StringBuilder(
            "SELECT DISTINCT s FROM Sale s " +
            "LEFT JOIN FETCH s.items i " +
            "LEFT JOIN FETCH i.product " +
            "LEFT JOIN FETCH s.customer c " +
            "WHERE s.saleDate >= :start AND s.saleDate <= :end AND s.user = :user "
        );

        if (customerName != null && !customerName.isBlank()) {
            jpql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :customerName ");
        }

        SaleStatus parsedStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                parsedStatus = SaleStatus.valueOf(status.trim().toUpperCase());
                jpql.append(" AND s.status = :status ");
            } catch (Exception ignored) {}
        }

        jpql.append("ORDER BY s.saleDate DESC");

        TypedQuery<Sale> query = getEntityManager()
                .createQuery(jpql.toString(), Sale.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .setParameter("user", user);

        if (customerName != null && !customerName.isBlank()) {
            query.setParameter("customerName", "%" + customerName.trim().toLowerCase() + "%");
        }

        if (parsedStatus != null) {
            query.setParameter("status", parsedStatus);
        }

        List<Sale> sales = query.getResultList();
        List<DailySalesSummaryDTO> result = new ArrayList<>();

        for (Sale s : sales) {
            BigDecimal grossRevenue = BigDecimal.ZERO;
            BigDecimal cost = BigDecimal.ZERO;
            long itemsSold = 0;
            List<String> prodDescriptions = new ArrayList<>();

            if (s.items != null) {
                for (SaleItem item : s.items) {
                    String pName = item.productName != null && !item.productName.isBlank()
                        ? item.productName
                        : (item.product != null && item.product.name != null ? item.product.name : "Produto não informado");
                    int qty = item.quantity != null ? item.quantity : 0;
                    itemsSold += qty;

                    BigDecimal itemRev = item.sellingPrice != null ? item.sellingPrice.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;
                    BigDecimal itemCost = item.purchasePrice != null ? item.purchasePrice.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;

                    if (!Boolean.TRUE.equals(s.isPersonalUse)) {
                        grossRevenue = grossRevenue.add(itemRev);
                        cost = cost.add(itemCost);
                    }

                    if (s.items.size() > 1 && qty > 0) {
                        String formattedItemRev = itemRev.setScale(2, java.math.RoundingMode.HALF_UP).toString().replace('.', ',');
                        prodDescriptions.add(pName + " (" + qty + " un. - R$ " + formattedItemRev + ")");
                    } else {
                        prodDescriptions.add(pName);
                    }
                }
            }

            BigDecimal saleDiscount = s.discount != null ? s.discount : BigDecimal.ZERO;
            BigDecimal netRevenue = grossRevenue.subtract(saleDiscount);
            if (netRevenue.compareTo(BigDecimal.ZERO) < 0) {
                netRevenue = BigDecimal.ZERO;
            }

            BigDecimal revenue;
            BigDecimal profit;
            BigDecimal amountPaid;
            BigDecimal remainingAmount;
            SaleStatus saleStatus;

            if (Boolean.TRUE.equals(s.isPersonalUse)) {
                revenue = BigDecimal.ZERO;
                profit = BigDecimal.ZERO;
                amountPaid = BigDecimal.ZERO;
                remainingAmount = BigDecimal.ZERO;
                saleStatus = SaleStatus.PAID;
            } else {
                revenue = netRevenue;
                profit = s.calculateTotalProfit();
                amountPaid = s.amountPaid != null ? s.amountPaid : (s.status == SaleStatus.PAID ? netRevenue : BigDecimal.ZERO);
                remainingAmount = netRevenue.subtract(amountPaid);
                if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
                    remainingAmount = BigDecimal.ZERO;
                }
                saleStatus = s.status != null ? s.status : SaleStatus.calculate(amountPaid, netRevenue);
            }

            String fullProductName = prodDescriptions.isEmpty() ? "Produto não informado" : String.join("\n", prodDescriptions);
            String custName = s.customer != null && s.customer.name != null ? s.customer.name : "Cliente não informado";

            result.add(new DailySalesSummaryDTO(
                s.saleDate,
                fullProductName,
                custName,
                revenue,
                cost,
                profit,
                itemsSold,
                s.isPersonalUse,
                s.observation,
                amountPaid,
                remainingAmount,
                saleStatus.name(),
                saleStatus.getDescription(),
                saleDiscount
            ));
        }

        return result;
    }
    
    // monthly summary
    public static List<MonthlySalesSummaryDTO> getMonthlySummaries(LocalDateTime start, LocalDateTime end, String customerName, User user) {
        if (user == null) {
            return List.of();
        }

        StringBuilder jpql = new StringBuilder(
            "SELECT DISTINCT s FROM Sale s " +
            "LEFT JOIN FETCH s.items i " +
            "LEFT JOIN FETCH i.product " +
            "LEFT JOIN FETCH s.customer c " +
            "WHERE s.saleDate >= :start AND s.saleDate <= :end AND s.user = :user "
        );

        if (customerName != null && !customerName.isBlank()) {
            jpql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :customerName ");
        }

        jpql.append("ORDER BY s.saleDate ASC");

        TypedQuery<Sale> query = getEntityManager()
                .createQuery(jpql.toString(), Sale.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .setParameter("user", user);

        if (customerName != null && !customerName.isBlank()) {
            query.setParameter("customerName", "%" + customerName.trim().toLowerCase() + "%");
        }

        List<Sale> sales = query.getResultList();
        Map<Integer, MonthlySalesSummaryDTO> map = new TreeMap<>();

        for (Sale s : sales) {
            int month = s.saleDate.getMonthValue();
            BigDecimal saleRev = BigDecimal.ZERO;
            BigDecimal saleCost = BigDecimal.ZERO;
            long saleItemsSold = 0;

            if (s.items != null) {
                for (SaleItem item : s.items) {
                    int qty = item.quantity != null ? item.quantity : 0;
                    saleItemsSold += qty;
                    if (!Boolean.TRUE.equals(s.isPersonalUse)) {
                        BigDecimal itemRev = item.sellingPrice != null ? item.sellingPrice.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;
                        BigDecimal itemCost = item.purchasePrice != null ? item.purchasePrice.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;
                        saleRev = saleRev.add(itemRev);
                        saleCost = saleCost.add(itemCost);
                    }
                }
            }

            if (!Boolean.TRUE.equals(s.isPersonalUse) && s.discount != null && s.discount.compareTo(BigDecimal.ZERO) > 0) {
                saleRev = saleRev.subtract(s.discount);
                if (saleRev.compareTo(BigDecimal.ZERO) < 0) saleRev = BigDecimal.ZERO;
            }

            BigDecimal saleProfit = Boolean.TRUE.equals(s.isPersonalUse) ? BigDecimal.ZERO : s.calculateTotalProfit();

            MonthlySalesSummaryDTO existing = map.get(month);
            if (existing == null) {
                map.put(month, new MonthlySalesSummaryDTO(month, saleRev, saleCost, saleProfit, saleItemsSold));
            } else {
                map.put(month, new MonthlySalesSummaryDTO(
                    month,
                    existing.revenue().add(saleRev),
                    existing.cost().add(saleCost),
                    existing.profit().add(saleProfit),
                    existing.itemsSold() + saleItemsSold
                ));
            }
        }

        return new ArrayList<>(map.values());
    }
}
