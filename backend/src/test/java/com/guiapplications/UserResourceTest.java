package com.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import com.guiapplications.entities.dto.CreateUserRequestDTO;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
public class UserResourceTest {

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
             .body("user.name", equalTo("Carlos Alberto"))
             .body("user.email", equalTo("carlos@teste.com"))
             .body("user.role", equalTo("USER"))
             .body("user.firstAccess", equalTo(true))
             .body("generatedPassword", notNullValue())
             .extract()
             .path("user.id");

        // 2. Delete user
        given()
          .when()
          .delete("/admin/users/" + userId)
          .then()
             .statusCode(204);
    }
}
