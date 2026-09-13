package com.guiapplications.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_batches", indexes = {
    @Index(name = "idx_batch_product_id", columnList = "product_id"),
    @Index(name = "idx_batch_user_id", columnList = "user_id"),
    @Index(name = "idx_batch_expiration_date", columnList = "expirationDate")
})
public class ProductBatch extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;

    @Column(name = "quantity", nullable = false)
    public Integer quantity;

    @Column(name = "purchaseDate", nullable = false)
    public LocalDate purchaseDate = LocalDate.now();

    @Column(name = "expirationDate", nullable = true)
    public LocalDate expirationDate;

    @Column(name = "purchasePrice", nullable = false, precision = 10, scale = 2)
    public BigDecimal purchasePrice;

    @Column(name = "sellingPrice", nullable = false, precision = 10, scale = 2)
    public BigDecimal sellingPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    public static List<ProductBatch> findByProductAndUser(Product product, User user) {
        if (product == null || user == null) {
            return List.of();
        }
        return list("product = ?1 AND user = ?2 ORDER BY CASE WHEN expirationDate IS NULL THEN 1 ELSE 0 END, expirationDate ASC, purchaseDate ASC", product, user);
    }

    public static List<ProductBatch> findByUser(User user) {
        if (user == null) {
            return List.of();
        }
        return list("SELECT pb FROM ProductBatch pb LEFT JOIN FETCH pb.product WHERE pb.user = ?1 ORDER BY CASE WHEN pb.expirationDate IS NULL THEN 1 ELSE 0 END, pb.expirationDate ASC, pb.purchaseDate ASC", user);
    }
}
