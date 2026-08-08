package com.guiapplications.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Product extends PanacheEntity {
	
	public String name;
	public Integer quantity;
	public LocalDate expirationDate;
	public BigDecimal purchasePrice;
	public BigDecimal sellingPrice;
	
	@ManyToOne
	@JoinColumn(name = "family_id")
	public Family family;
	
	@ManyToOne
	@JoinColumn(name = "brand_id")
	public Brand brand;
	
	@ManyToOne
	@JoinColumn(name = "category_id")
	public Category category;
	
	// search products by name
	public static List<Product> findByName(String name) {
        return list("LOWER(name) LIKE LOWER(?1)", "%" + name + "%");
    }

    // search products to expire in a period of days
    public static List<Product> findExpiringInDays(int days) {
        LocalDate limitDate = LocalDate.now().plusDays(days);
        return list("expirationDate <= ?1 AND expirationDate >= ?2", limitDate, LocalDate.now());
    }
}
