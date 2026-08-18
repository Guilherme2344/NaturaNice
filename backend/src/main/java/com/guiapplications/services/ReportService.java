package com.guiapplications.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Year;
import java.time.YearMonth;
import java.util.List;

import com.guiapplications.entities.Sale;
import com.guiapplications.entities.User;
import com.guiapplications.entities.dto.AnnualSalesReportDTO;
import com.guiapplications.entities.dto.DailySalesSummaryDTO;
import com.guiapplications.entities.dto.MonthlySalesReportDTO;
import com.guiapplications.entities.dto.MonthlySalesSummaryDTO;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ReportService {

    public MonthlySalesReportDTO getMonthlyReport(int year, int month, String customerName) {
        return getMonthlyReport(year, month, customerName, null);
    }

    // monthly report
    public MonthlySalesReportDTO getMonthlyReport(int year, int month, String customerName, Long userId) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(LocalTime.MAX);

        User user = userId != null ? User.findById(userId) : null;
        List<DailySalesSummaryDTO> dailySummaries = Sale.getDailySummaries(start, end, customerName, user);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (DailySalesSummaryDTO day : dailySummaries) {
            totalRevenue = totalRevenue.add(day.revenue() != null ? day.revenue() : BigDecimal.ZERO);
            totalCost = totalCost.add(day.cost() != null ? day.cost() : BigDecimal.ZERO);
            totalProfit = totalProfit.add(day.profit() != null ? day.profit() : BigDecimal.ZERO);
            totalItemsSold += day.itemsSold();
        }

        return new MonthlySalesReportDTO(year, month, totalRevenue, totalCost, totalProfit, totalItemsSold, dailySummaries);
    }

    public AnnualSalesReportDTO getAnnualReport(int year, String customerName) {
        return getAnnualReport(year, customerName, null);
    }

    // annual report
    public AnnualSalesReportDTO getAnnualReport(int year, String customerName, Long userId) {
        Year y = Year.of(year);
        LocalDateTime start = y.atDay(1).atStartOfDay();
        LocalDateTime end = y.atMonth(12).atEndOfMonth().atTime(LocalTime.MAX);

        User user = userId != null ? User.findById(userId) : null;
        List<MonthlySalesSummaryDTO> monthlySummaries = Sale.getMonthlySummaries(start, end, customerName, user);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalProfit = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (MonthlySalesSummaryDTO month : monthlySummaries) {
            totalRevenue = totalRevenue.add(month.revenue() != null ? month.revenue() : BigDecimal.ZERO);
            totalCost = totalCost.add(month.cost() != null ? month.cost() : BigDecimal.ZERO);
            totalProfit = totalProfit.add(month.profit() != null ? month.profit() : BigDecimal.ZERO);
            totalItemsSold += month.itemsSold();
        }

        return new AnnualSalesReportDTO(year, totalRevenue, totalCost, totalProfit, totalItemsSold, monthlySummaries);
    }
}