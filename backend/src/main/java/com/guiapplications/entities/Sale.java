package com.guiapplications.entities;

import java.time.LocalDateTime;
import java.util.List;

import com.guiapplications.entities.dto.DailySalesSummaryDTO;
import com.guiapplications.entities.dto.MonthlySalesSummaryDTO;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.TypedQuery;

@Entity
@Table(name = "Sale", indexes = {
    @Index(name = "idx_sale_date", columnList = "saleDate"),
    @Index(name = "idx_sale_user_id", columnList = "user_id")
})
public class Sale extends PanacheEntity {

    @Column(name = "saleDate", nullable = false)
    public LocalDateTime saleDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = true)
    public Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    public User user;
    
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
    public List<SaleItem> items;
    
    // daily sales summary
    public static List<DailySalesSummaryDTO> getDailySummaries(LocalDateTime start, LocalDateTime end, String customerName, User user) {
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
            "WHERE s.saleDate >= :start AND s.saleDate <= :end "
        );

        if (user != null) {
            jpql.append(" AND s.user = :user ");
        }

        if (customerName != null && !customerName.isBlank()) {
            jpql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :customerName ");
        }

        jpql.append("GROUP BY s.saleDate, COALESCE(c.name, 'Cliente não informado'), s.id ");
        jpql.append("ORDER BY s.saleDate DESC");

        TypedQuery<DailySalesSummaryDTO> query = getEntityManager()
                .createQuery(jpql.toString(), DailySalesSummaryDTO.class)
                .setParameter("start", start)
                .setParameter("end", end);

        if (user != null) {
            query.setParameter("user", user);
        }

        if (customerName != null && !customerName.isBlank()) {
            query.setParameter("customerName", "%" + customerName.trim().toLowerCase() + "%");
        }

        return query.getResultList();
    }
    
    // monthly summary
    public static List<MonthlySalesSummaryDTO> getMonthlySummaries(LocalDateTime start, LocalDateTime end, String customerName, User user) {
        StringBuilder jpql = new StringBuilder(
            "SELECT new com.guiapplications.entities.dto.MonthlySalesSummaryDTO(" +
            "  MONTH(s.saleDate), " +
            "  COALESCE(c.name, 'Cliente não informado'), " +
            "  SUM(i.sellingPrice * i.quantity), " +
            "  SUM(i.purchasePrice * i.quantity), " +
            "  SUM((i.sellingPrice - i.purchasePrice) * i.quantity), " +
            "  SUM(i.quantity) " +
            ") " +
            "FROM SaleItem i JOIN i.sale s LEFT JOIN s.customer c " +
            "WHERE s.saleDate >= :start AND s.saleDate <= :end "
        );

        if (user != null) {
            jpql.append(" AND s.user = :user ");
        }

        if (customerName != null && !customerName.isBlank()) {
            jpql.append(" AND CAST(unaccent(LOWER(c.name)) AS String) LIKE :customerName ");
        }

        jpql.append("GROUP BY MONTH(s.saleDate), COALESCE(c.name, 'Cliente não informado') ");
        jpql.append("ORDER BY MONTH(s.saleDate) ASC, COALESCE(c.name, 'Cliente não informado') ASC");

        TypedQuery<MonthlySalesSummaryDTO> query = getEntityManager()
                .createQuery(jpql.toString(), MonthlySalesSummaryDTO.class)
                .setParameter("start", start)
                .setParameter("end", end);

        if (user != null) {
            query.setParameter("user", user);
        }

        if (customerName != null && !customerName.isBlank()) {
            query.setParameter("customerName", "%" + customerName.trim().toLowerCase() + "%");
        }

        return query.getResultList();
    }
}
