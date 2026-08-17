package com.guiapplications.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "sale_items")
public class SaleItem extends PanacheEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    @JsonIgnore
    public Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    public Product product;

    @Column(nullable = false)
    public Integer quantity;

    @Column(name = "purchase_price", nullable = false, precision = 10, scale = 2)
    public BigDecimal purchasePrice;

    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    public BigDecimal sellingPrice;

    // item profit
    @Transient
    public BigDecimal getUnitProfit() {
        if (sellingPrice == null || purchasePrice == null) {
            return BigDecimal.ZERO;
        }
        return sellingPrice.subtract(purchasePrice);
    }

    // item profit * quantity
    @Transient
    public BigDecimal getTotalProfit() {
        if (quantity == null) {
            return BigDecimal.ZERO;
        }
        return getUnitProfit().multiply(BigDecimal.valueOf(quantity));
    }

    // selling price * quantity
    @Transient
    public BigDecimal getTotalAmount() {
        if (sellingPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return sellingPrice.multiply(BigDecimal.valueOf(quantity));
    }
}