package com.guiapplications.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.Sale;
import com.guiapplications.entities.SaleItem;

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
        try {
            em.createNativeQuery("CREATE EXTENSION IF NOT EXISTS unaccent;").executeUpdate();
        } catch (Exception ignored) {}
        try {
            em.createNativeQuery("ALTER TABLE sale_items ALTER COLUMN product_id DROP NOT NULL;").executeUpdate();
        } catch (Exception ignored) {}
    }
	
    @Transactional
    public void runSeeder(@Observes StartupEvent event) {
        // if products are not registered yet
        if (Product.count() == 0) {
            
            // families
            Family maquiagem = createFamily("Maquiagem");
            Family skincare = createFamily("Skincare");
            Family cuidados = createFamily("Cuidados Corporais");

            // brands
            Brand eudora = createBrand("Eudora", "#53308D");
            Brand natura = createBrand("Natura", "#F38120");
            Brand mary = createBrand("Mary Kay", "#ED3E94");

            // categories
            Category batom = createCategory("Batom");
            Category base = createCategory("Base Facial");
            Category hidratante = createCategory("Hidratante");

            // products
            Product batomProd = createProduct(
                "Batom Ultramatte Vermelho",
                15,
                LocalDate.of(2027, 8, 15),
                "15.00",
                "29.90",
                maquiagem,
                eudora,
                batom
            );

            Product baseProd = createProduct(
                "Base Líquida Checkmat",
                8,
                LocalDate.of(2026, 11, 30),
                "35.00",
                "62.00",
                maquiagem,
                mary,
                base
            );

            Product cremeProd = createProduct(
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

            // Seed sample sales for demonstration in reports
            if (Sale.count() == 0) {
                createSale(batomProd, 2, batomProd.sellingPrice, LocalDateTime.now().minusDays(2));
                createSale(baseProd, 1, baseProd.sellingPrice, LocalDateTime.now().minusDays(5));
                createSale(cremeProd, 3, cremeProd.sellingPrice, LocalDateTime.now().minusDays(10));
            }
        }
    }

    private Family createFamily(String name) {
        Family f = new Family();
        f.name = name;
        f.persist();
        return f;
    }

    private Brand createBrand(String name, String hexColor) {
        Brand b = new Brand();
        b.name = name;
        b.hexColor = hexColor;
        b.persist();
        return b;
    }

    private Category createCategory(String name) {
        Category c = new Category();
        c.name = name;
        c.persist();
        return c;
    }

    private Product createProduct(String name, Integer quantity, LocalDate expDate, 
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
        return p;
    }

    private void createSale(Product product, int quantity, BigDecimal sellingPrice, LocalDateTime date) {
        Sale sale = new Sale();
        sale.saleDate = date;
        sale.items = new ArrayList<>();

        SaleItem item = new SaleItem();
        item.sale = sale;
        item.product = product;
        item.quantity = quantity;
        item.purchasePrice = product.purchasePrice != null ? product.purchasePrice : BigDecimal.ZERO;
        item.sellingPrice = sellingPrice;

        sale.items.add(item);
        sale.persist();
    }
}