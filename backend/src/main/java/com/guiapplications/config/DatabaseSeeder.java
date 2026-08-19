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
import com.guiapplications.entities.User;
import com.guiapplications.enums.Role;
import com.guiapplications.services.AuthService;

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
        // Seed Default Admin User
        User admin = User.findByEmail("admin@sistema.com");
        if (admin == null) {
            admin = new User();
            admin.name = "Administrador";
            admin.email = "admin@sistema.com";
            admin.password = AuthService.hashPassword("admin123");
            admin.role = Role.ADMIN;
            admin.firstAccess = false;
            admin.persist();
        }

        // if products are not registered yet
        if (Product.count() == 0) {
            
            // families
            Family maquiagem = createFamily("Maquiagem", admin);
            Family skincare = createFamily("Skincare", admin);
            Family cuidados = createFamily("Cuidados Corporais", admin);

            // brands
            Brand eudora = createBrand("Eudora", "#53308D", admin);
            Brand natura = createBrand("Natura", "#F38120", admin);
            Brand mary = createBrand("Mary Kay", "#ED3E94", admin);

            // categories
            Category batom = createCategory("Batom", admin);
            Category base = createCategory("Base Facial", admin);
            Category hidratante = createCategory("Hidratante", admin);

            // products
            Product batomProd = createProduct(
                "Batom Ultramatte Vermelho",
                15,
                LocalDate.of(2027, 8, 15),
                "15.00",
                "29.90",
                maquiagem,
                eudora,
                batom,
                admin
            );

            Product baseProd = createProduct(
                "Base Líquida Checkmat",
                8,
                LocalDate.of(2026, 11, 30),
                "35.00",
                "62.00",
                maquiagem,
                mary,
                base,
                admin
            );

            Product cremeProd = createProduct(
                "Creme Hidratante Tododia Algodão",
                20,
                LocalDate.of(2028, 1, 10),
                "22.50",
                "48.90",
                cuidados,
                natura,
                hidratante,
                admin
            );

            createProduct(
                "Sérum Facial Chronos",
                5,
                LocalDate.of(2026, 12, 1),
                "60.00",
                "120.00",
                skincare,
                natura,
                base,
                admin
            );

            // Seed sample sales for demonstration in reports
            if (Sale.count() == 0) {
                createSale(batomProd, 2, batomProd.sellingPrice, LocalDateTime.now().minusDays(2), admin);
                createSale(baseProd, 1, baseProd.sellingPrice, LocalDateTime.now().minusDays(5), admin);
                createSale(cremeProd, 3, cremeProd.sellingPrice, LocalDateTime.now().minusDays(10), admin);
            }
        }
    }

    private Family createFamily(String name, User user) {
        Family f = new Family();
        f.name = name;
        f.user = user;
        f.persist();
        return f;
    }

    private Brand createBrand(String name, String hexColor, User user) {
        Brand b = new Brand();
        b.name = name;
        b.hexColor = hexColor;
        b.user = user;
        b.persist();
        return b;
    }

    private Category createCategory(String name, User user) {
        Category c = new Category();
        c.name = name;
        c.user = user;
        c.persist();
        return c;
    }

    private Product createProduct(String name, Integer quantity, LocalDate expDate, 
                                  String cost, String price, Family family, 
                                  Brand brand, Category category, User user) {
        Product p = new Product();
        p.name = name;
        p.quantity = quantity;
        p.expirationDate = expDate;
        p.purchasePrice = new BigDecimal(cost);
        p.sellingPrice = new BigDecimal(price);
        p.family = family;
        p.brand = brand;
        p.category = category;
        p.user = user;
        
        p.persist();
        return p;
    }

    private void createSale(Product product, int quantity, BigDecimal sellingPrice, LocalDateTime date, User user) {
        Sale sale = new Sale();
        sale.saleDate = date;
        sale.user = user;
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