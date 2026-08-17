package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlySalesReportDTO(
		int year,
		int month,
		BigDecimal totalRevenue,
		BigDecimal totalCost,
		BigDecimal totalProfit,
		long totalItemsSold,
		List<DailySalesSummaryDTO> dailySummaries
) {}