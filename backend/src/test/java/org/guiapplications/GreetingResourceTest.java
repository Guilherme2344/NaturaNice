package org.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;

@QuarkusTest
class GreetingResourceTest {
    @Test
    void testMonthlyReportEndpoint() {
        given()
          .when().get("/report/monthly")
          .then()
             .statusCode(200)
             .body("dailySummaries", notNullValue());
    }

}