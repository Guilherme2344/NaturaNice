package com.guiapplications.entities;

import java.util.List;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;

@Entity
public class Brand extends PanacheEntity {
	
	public String name;
	
	// search brands by name
	public static List<Brand> findByName(String name) {
        return list("LOWER(name) LIKE LOWER(?1)", "%" + name + "%");
    }
}
