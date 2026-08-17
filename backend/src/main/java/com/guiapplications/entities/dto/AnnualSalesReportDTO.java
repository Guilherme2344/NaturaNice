package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnnualSalesReportDTO(int year,
	BigDecimal totalRevenue,
	BigDecimal totalCost,
	BigDecimal totalProfit,
	long totalItemsSold,
	List<MonthlySalesSummaryDTO> monthlySummaries
) {}
