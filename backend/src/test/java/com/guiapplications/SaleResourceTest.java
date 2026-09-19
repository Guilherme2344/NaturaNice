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
import java.util.UUID;

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
        User admin = User.findByEmail("admin@sistema.com");
        Brand brand = Brand.findAll().firstResult();
        Category category = Category.findAll().firstResult();
        Family family = Family.findAll().firstResult();

        Product p = Product.find("name", "Produto Teste Venda").firstResult();
        if (p == null) {
            p = new Product();
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
        } else {
            p.quantity = 10;
            p.persist();
        }
    }

    @Test
    public void testCreateSaleDecrementsStock() {
        Product product = Product.find("name", "Produto Teste Venda").firstResult();
        int initialStock = product.quantity;
        UUID productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, 1, new BigDecimal("25.00"), new BigDecimal("25.00"), "Maria Silva");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("productId", equalTo(productId.toString()))
             .body("quantity", equalTo(1))
             .body("customerName", equalTo("Maria Silva"))
             .body("status", equalTo("PAID"));

        Product.getEntityManager().clear();
        Product updatedProduct = Product.findById(productId);
        assertEquals(initialStock - 1, updatedProduct.quantity.intValue());
    }

    @Test
    public void testCreateSaleReachingZeroStockAutoDeletesProduct() {
        Product product = Product.find("name", "Produto Teste Venda").firstResult();
        int fullStock = product.quantity;
        UUID productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, fullStock, new BigDecimal("30.00"), new BigDecimal("30.00"), "João Souza");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("quantity", equalTo(fullStock));

        Product.getEntityManager().clear();
        Product deletedProduct = Product.findById(productId);
        assertNull(deletedProduct, "Product should be deleted when stock reaches 0");
    }

    @Test
    public void testCreateSaleWithZeroAmountPaidSetsUnpaidStatus() {
        Product product = Product.find("name", "Produto Teste Venda").firstResult();
        UUID productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(productId, 1, new BigDecimal("25.00"), BigDecimal.ZERO, "Carlos Cliente");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("status", equalTo("UNPAID"))
             .body("statusDescription", equalTo("Não pago"));
    }

    @Test
    public void testCreateMultiProductSale() {
        Product product = Product.find("name", "Produto Teste Venda").firstResult();
        UUID productId = product.id;

        com.guiapplications.entities.dto.SaleItemRequestDTO item =
            new com.guiapplications.entities.dto.SaleItemRequestDTO(productId, 2, new BigDecimal("30.00"));

        SaleRequestDTO request = new SaleRequestDTO(
            null, null, null, null, new BigDecimal("60.00"), "Multi Cliente", "Venda de teste", false, java.util.List.of(item)
        );

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("quantity", equalTo(2))
             .body("totalAmount", equalTo(60.0f))
             .body("status", equalTo("PAID"));
    }

    @Test
    public void testCreateSaleWithPaymentMethod() {
        Product product = Product.find("name", "Produto Teste Venda").firstResult();
        UUID productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(
            productId, null, 1, new BigDecimal("25.00"), new BigDecimal("25.00"), "Ana Paula", "Teste Pix", false, null,
            com.guiapplications.enums.PaymentMethod.PIX
        );

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .body("saleId", notNullValue())
             .body("paymentMethod", equalTo("PIX"))
             .body("paymentMethodDescription", equalTo("Pix"));
    }

    @Test
    public void testAddSalePaymentWithPaymentMethod() {
        Product product = Product.find("name", "Produto Teste Venda").firstResult();
        UUID productId = product.id;

        SaleRequestDTO request = new SaleRequestDTO(
            productId, 1, new BigDecimal("50.00"), BigDecimal.ZERO, "Marcos Devedor"
        );

        String saleIdStr = given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/sales")
          .then()
             .statusCode(201)
             .extract()
             .path("saleId");

        UUID saleId = UUID.fromString(saleIdStr);

        given()
          .contentType(ContentType.JSON)
          .body(java.util.Map.of("amount", 20.00, "paymentMethod", "CARD"))
          .when()
          .post("/sales/" + saleId + "/payments")
          .then()
             .statusCode(200);

        com.guiapplications.entities.SalePayment payment =
            com.guiapplications.entities.SalePayment.find("sale.id", saleId).firstResult();
        assertEquals(com.guiapplications.enums.PaymentMethod.CARD, payment.paymentMethod);
    }
}
