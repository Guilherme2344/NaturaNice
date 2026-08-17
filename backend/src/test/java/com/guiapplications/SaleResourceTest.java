package com.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import com.guiapplications.entities.Product;
import com.guiapplications.entities.dto.SaleRequestDTO;

import java.math.BigDecimal;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@QuarkusTest
public class SaleResourceTest {

    @Test
    public void testCreateSaleDecrementsStock() {
        Product product = Product.findAll().firstResult();
        int initialStock = product.quantity;
        long productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, 1, new BigDecimal("25.00"));

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("productId", equalTo((int) productId))
             .body("quantity", equalTo(1));

        Product.getEntityManager().clear();
        Product updatedProduct = Product.findById(productId);
        assertEquals(initialStock - 1, updatedProduct.quantity.intValue());
    }

    @Test
    public void testCreateSaleReachingZeroStockAutoDeletesProduct() {
        Product product = Product.findAll().firstResult();
        int fullStock = product.quantity;
        long productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, fullStock, new BigDecimal("30.00"));

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
