package com.guiapplications.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
@Table(name = "sale_payments", indexes = {
    @Index(name = "idx_payment_date", columnList = "payment_date"),
    @Index(name = "idx_payment_sale_id", columnList = "sale_id")
})
public class SalePayment extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    public UUID id;

    @Column(name = "payment_date", nullable = false)
    public LocalDateTime paymentDate;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    public BigDecimal amount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    public Sale sale;
}
