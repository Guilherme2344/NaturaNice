package com.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import com.guiapplications.entities.dto.ForgotPasswordRequestDTO;
import com.guiapplications.entities.dto.LoginRequestDTO;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
public class AuthResourceTest {

    @Test
    public void testLoginWithDefaultAdmin() {
        LoginRequestDTO request = new LoginRequestDTO("admin@sistema.com", "admin123");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/auth/login")
          .then()
             .statusCode(200)
             .body("token", notNullValue())
             .body("user.email", equalTo("admin@sistema.com"))
             .body("user.role", equalTo("ADMIN"))
             .body("user.firstAccess", equalTo(false));
    }

    @Test
    public void testLoginWithNonExistingUser() {
        LoginRequestDTO request = new LoginRequestDTO("usuario_inexistente@teste.com", "123456");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/auth/login")
          .then()
             .statusCode(400)
             .body("message", equalTo("E-mail ou senha inválidos."));
    }

    @Test
    public void testLoginWithInvalidPassword() {
        LoginRequestDTO request = new LoginRequestDTO("admin@sistema.com", "wrongpass");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/auth/login")
          .then()
             .statusCode(400)
             .body("message", equalTo("E-mail ou senha inválidos."));
    }

    @Test
    public void testForgotPasswordGeneratesCode() {
        ForgotPasswordRequestDTO request = new ForgotPasswordRequestDTO("admin@sistema.com");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/auth/forgot-password")
          .then()
             .statusCode(200)
             .body("message", notNullValue());
    }
}
