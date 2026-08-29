package com.guiapplications.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.guiapplications.entities.dto.DailySalesSummaryDTO;
import com.guiapplications.entities.dto.MonthlySalesSummaryDTO;
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
    
    // daily sales summary
    public static List<DailySalesSummaryDTO> getDailySummaries(LocalDateTime start, LocalDateTime end, String customerName, User user) {
        if (user == null) {
            return List.of();
        }

        StringBuilder jpql = new StringBuilder(
            "SELECT new com.guiapplications.entities.dto.DailySalesSummaryDTO(" +
            "  s.saleDate, " +
            "  COALESCE(c.name, 'Cliente não informado'), " +
            "  SUM(i.sellingPrice * i.quantity), " +
            "  SUM(i.purchasePrice * i.quantity), " +
            "  SUM((i.sellingPrice - i.purchasePrice) * i.quantity), " +
            "  SUM(i.quantity) " +
            ") " +
            "FROM SaleItem i JOIN i.sale s LEFT JOIN s.customer c " +
            "WHERE s.saleDate >= :start AND s.saleDate <= :end AND s.user = :user "
        );

        if (customerName != null && !customerName.isBlank()) {
            jpql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :customerName ");
        }

        jpql.append("GROUP BY s.saleDate, COALESCE(c.name, 'Cliente não informado'), s.id ");
        jpql.append("ORDER BY s.saleDate DESC");

        TypedQuery<DailySalesSummaryDTO> query = getEntityManager()
                .createQuery(jpql.toString(), DailySalesSummaryDTO.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .setParameter("user", user);

        if (customerName != null && !customerName.isBlank()) {
            query.setParameter("customerName", "%" + customerName.trim().toLowerCase() + "%");
        }

        return query.getResultList();
    }
    
    // monthly summary
    public static List<MonthlySalesSummaryDTO> getMonthlySummaries(LocalDateTime start, LocalDateTime end, String customerName, User user) {
        if (user == null) {
            return List.of();
        }

        StringBuilder jpql = new StringBuilder(
            "SELECT new com.guiapplications.entities.dto.MonthlySalesSummaryDTO(" +
            "  MONTH(s.saleDate), " +
            "  SUM(i.sellingPrice * i.quantity), " +
            "  SUM(i.purchasePrice * i.quantity), " +
            "  SUM((i.sellingPrice - i.purchasePrice) * i.quantity), " +
            "  SUM(i.quantity) " +
            ") " +
            "FROM SaleItem i JOIN i.sale s LEFT JOIN s.customer c " +
            "WHERE s.saleDate >= :start AND s.saleDate <= :end AND s.user = :user "
        );

        if (customerName != null && !customerName.isBlank()) {
            jpql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :customerName ");
        }

        jpql.append("GROUP BY MONTH(s.saleDate) ");
        jpql.append("ORDER BY MONTH(s.saleDate) ASC");

        TypedQuery<MonthlySalesSummaryDTO> query = getEntityManager()
                .createQuery(jpql.toString(), MonthlySalesSummaryDTO.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .setParameter("user", user);

        if (customerName != null && !customerName.isBlank()) {
            query.setParameter("customerName", "%" + customerName.trim().toLowerCase() + "%");
        }

        return query.getResultList();
    }
}
