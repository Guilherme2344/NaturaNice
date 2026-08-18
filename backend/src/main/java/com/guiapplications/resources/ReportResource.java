package com.guiapplications.resources;

import java.time.LocalDate;

import com.guiapplications.entities.dto.AnnualSalesReportDTO;
import com.guiapplications.entities.dto.MonthlySalesReportDTO;
import com.guiapplications.services.ReportService;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/report")
@Produces(MediaType.APPLICATION_JSON)
public class ReportResource {

    @Inject
    ReportService reportService;

    // monthly report
    @GET
    @Path("/monthly")
    public MonthlySalesReportDTO getMonthlyReport(
            @QueryParam("year") Integer year,
            @QueryParam("month") Integer month,
            @QueryParam("customerName") String customerName,
            @HeaderParam("X-User-Id") Long userId) {

        int selectedYear = (year != null) ? year : LocalDate.now().getYear();
        int selectedMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        return reportService.getMonthlyReport(selectedYear, selectedMonth, customerName, userId);
    }

    // annual report
    @GET
    @Path("/annual")
    public AnnualSalesReportDTO getAnnualReport(
            @QueryParam("year") Integer year,
            @QueryParam("customerName") String customerName,
            @HeaderParam("X-User-Id") Long userId) {
        int selectedYear = (year != null) ? year : LocalDate.now().getYear();

        return reportService.getAnnualReport(selectedYear, customerName, userId);
    }
}