package com.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.guiapplications.entities.Brand;
import com.guiapplications.entities.Category;
import com.guiapplications.entities.Family;
import com.guiapplications.entities.Product;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.SaleRequestDTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@QuarkusTest
public class SaleResourceTest {

    @BeforeEach
    @Transactional
    public void setup() {
        if (Product.count() == 0) {
            User admin = User.findByEmail("admin@sistema.com");
            Brand brand = Brand.findAll().firstResult();
            Category category = Category.findAll().firstResult();
            Family family = Family.findAll().firstResult();

            Product p = new Product();
            p.name = "Produto Teste Venda";
            p.quantity = 10;
            p.expirationDate = LocalDate.now().plusMonths(6);
            p.purchasePrice = new BigDecimal("10.00");
            p.sellingPrice = new BigDecimal("20.00");
            p.brand = brand;
            p.category = category;
            p.family = family;
            p.user = admin;
            p.persist();
        }
    }

    @Test
    public void testCreateSaleDecrementsStock() {
        Product product = Product.findAll().firstResult();
        int initialStock = product.quantity;
        long productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, 1, new BigDecimal("25.00"), "Maria Silva");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("productId", equalTo((int) productId))
             .body("quantity", equalTo(1))
             .body("customerName", equalTo("Maria Silva"));

        Product.getEntityManager().clear();
        Product updatedProduct = Product.findById(productId);
        assertEquals(initialStock - 1, updatedProduct.quantity.intValue());
    }

    @Test
    public void testCreateSaleReachingZeroStockAutoDeletesProduct() {
        Product product = Product.findAll().firstResult();
        int fullStock = product.quantity;
        long productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, fullStock, new BigDecimal("30.00"), "João Souza");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("productId", equalTo((int) productId))
             .body("quantity", equalTo(fullStock));

        Product.getEntityManager().clear();
        Product deletedProduct = Product.findById(productId);
        assertNull(deletedProduct, "Product should be deleted when stock reaches 0");
    }
}
