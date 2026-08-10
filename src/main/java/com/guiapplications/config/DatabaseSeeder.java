package com.guiapplications.config;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DatabaseSeeder {

	@Inject
    EntityManager em;

    @Transactional
    public void initExtension(@Observes StartupEvent event) {
        // Enables unaccent in database
        em.createNativeQuery("CREATE EXTENSION IF NOT EXISTS unaccent;").executeUpdate();
    }
	
    @Transactional
    public void runSeeder(@Observes StartupEvent event) {
        // if products are registered
        if (Product.count() == 0) {
            
            // families
            Family maquiagem = createFamily("Maquiagem");
            Family skincare = createFamily("Skincare");
            Family cuidados = createFamily("Cuidados Corporais");

            // brands
            Brand avon = createBrand("Avon");
            Brand natura = createBrand("Natura");
            Brand boticario = createBrand("O Boticário");

            // categories
            Category batom = createCategory("Batom");
            Category base = createCategory("Base Facial");
            Category hidratante = createCategory("Hidratante");

            // products
            createProduct(
                "Batom Ultramatte Vermelho",
                15,
                LocalDate.of(2027, 8, 15),
                "15.00",
                "29.90",
                maquiagem,
                avon,
                batom
            );

            createProduct(
                "Base Líquida Checkmat",
                8,
                LocalDate.of(2026, 11, 30),
                "35.00",
                "62.00",
                maquiagem,
                boticario,
                base
            );

            createProduct(
                "Creme Hidratante Tododia Algodão",
                20,
                LocalDate.of(2028, 1, 10),
                "22.50",
                "48.90",
                cuidados,
                natura,
                hidratante
            );

            createProduct(
                "Sérum Facial Chronos",
                5,
                LocalDate.of(2026, 12, 1),
                "60.00",
                "120.00",
                skincare,
                natura,
                base
            );
        }
    }

    private Family createFamily(String name) {
        Family f = new Family();
        f.name = name;
        f.persist();
        return f;
    }

    private Brand createBrand(String name) {
        Brand b = new Brand();
        b.name = name;
        b.persist();
        return b;
    }

    private Category createCategory(String name) {
        Category c = new Category();
        c.name = name;
        c.persist();
        return c;
    }

    private void createProduct(String name, Integer quantity, LocalDate expDate, 
                               String cost, String price, Family family, 
                               Brand brand, Category category) {
        Product p = new Product();
        p.name = name;
        p.quantity = quantity;
        p.expirationDate = expDate;
        p.purchasePrice = new BigDecimal(cost);
        p.sellingPrice = new BigDecimal(price);
        p.family = family;
        p.brand = brand;
        p.category = category;
        
        p.persist();
    }
}