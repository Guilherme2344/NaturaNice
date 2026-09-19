package com.guiapplications;

import com.guiapplications.enums.Role;
import com.guiapplications.services.AuthService;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.guiapplications.entities.TwoFactorToken;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.ForgotPasswordRequestDTO;
import com.guiapplications.entities.dto.LoginRequestDTO;
import com.guiapplications.entities.dto.ResendTwoFactorRequestDTO;
import com.guiapplications.entities.dto.TwoFactorVerifyRequestDTO;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@QuarkusTest
public class AuthResourceTest {

    @BeforeEach
    @Transactional
    public void setup() {
        TwoFactorToken.deleteByEmail("admin@sistema.com");
        User admin = User.findByEmail("admin@sistema.com");
        if (admin == null) {
            admin = new User();
            admin.name = "Administrador";
            admin.email = "admin@sistema.com";
            admin.password = AuthService.hashPassword("admin123");
            admin.role = Role.ADMIN;
            admin.firstAccess = false;
            admin.persist();
        } else {
            admin.password = AuthService.hashPassword("admin123");
            admin.persist();
        }
    }

    @Test
    public void testLoginWithDefaultAdminTriggers2FA() {
        LoginRequestDTO request = new LoginRequestDTO("admin@sistema.com", "admin123");

        given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/auth/login")
          .then()
             .statusCode(200)
             .body("twoFactorRequired", equalTo(true))
             .body("email", equalTo("admin@sistema.com"));

        // Verify that a 2FA token was created in DB
        TwoFactorToken token = TwoFactorToken.find("email", "admin@sistema.com").firstResult();
        assertNotNull(token);
        assertNotNull(token.code);

        // Test 2FA verification with valid code
        TwoFactorVerifyRequestDTO verifyRequest = new TwoFactorVerifyRequestDTO("admin@sistema.com", token.code);

        given()
          .contentType(ContentType.JSON)
          .body(verifyRequest)
          .when()
          .post("/auth/verify-2fa")
          .then()
             .statusCode(200)
             .body("token", notNullValue())
             .body("user.email", equalTo("admin@sistema.com"))
             .body("user.role", equalTo("ADMIN"))
             .body("user.firstAccess", equalTo(false));
    }

    @Test
    public void testVerifyTwoFactorWithInvalidCode() {
        TwoFactorVerifyRequestDTO verifyRequest = new TwoFactorVerifyRequestDTO("admin@sistema.com", "000000");

        given()
          .contentType(ContentType.JSON)
          .body(verifyRequest)
          .when()
          .post("/auth/verify-2fa")
          .then()
             .statusCode(400)
             .body("message", notNullValue());
    }

    @Test
    public void testResendTwoFactor() {
        ResendTwoFactorRequestDTO resendRequest = new ResendTwoFactorRequestDTO("admin@sistema.com");

        given()
          .contentType(ContentType.JSON)
          .body(resendRequest)
          .when()
          .post("/auth/resend-2fa")
          .then()
             .statusCode(200)
             .body("message", equalTo("Código de verificação reenviado com sucesso para o seu e-mail."));
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
