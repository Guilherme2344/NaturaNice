package com.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.CreateUserRequestDTO;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
public class UserResourceTest {

    @BeforeEach
    @Transactional
    public void setup() {
        User.delete("email", "carlos@teste.com");
    }

    @Test
    public void testCreateAndDeleteUser() {
        CreateUserRequestDTO request = new CreateUserRequestDTO("Carlos Alberto", "carlos@teste.com");

        // 1. Create user
        Integer userId = given()
          .contentType(ContentType.JSON)
          .body(request)
          .when()
          .post("/admin/users")
          .then()
             .statusCode(201)
             .body("name", equalTo("Carlos Alberto"))
             .body("email", equalTo("carlos@teste.com"))
             .body("role", equalTo("USER"))
             .body("firstAccess", equalTo(true))
             .extract()
             .path("id");

        // 2. Delete user
        given()
          .when()
          .delete("/admin/users/" + userId)
          .then()
             .statusCode(204);
    }
}
