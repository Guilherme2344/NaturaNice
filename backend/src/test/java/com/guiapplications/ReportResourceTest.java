package com.guiapplications;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.notNullValue;

@QuarkusTest
public class ReportResourceTest {

    @Test
    public void testGetMonthlyReportEndpoint() {
        given()
          .when().get("/report/monthly")
          .then()
             .statusCode(200)
             .body("dailySummaries", notNullValue())
             .body("totalItemsSold", greaterThanOrEqualTo(0));
    }

    @Test
    public void testGetAnnualReportEndpoint() {
        given()
          .when().get("/report/annual")
          .then()
             .statusCode(200)
             .body("monthlySummaries", notNullValue())
             .body("totalItemsSold", greaterThanOrEqualTo(0));
    }
}
