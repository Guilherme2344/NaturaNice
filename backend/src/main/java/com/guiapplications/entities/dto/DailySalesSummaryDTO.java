package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesSummaryDTO(
		LocalDate date,
		String customerName,
		BigDecimal revenue,
		BigDecimal cost,
		BigDecimal profit,
		long itemsSold
) {
	public DailySalesSummaryDTO(java.sql.Date sqlDate, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(sqlDate != null ? sqlDate.toLocalDate() : null, customerName, revenue, cost, profit, itemsSold);
	}

	public DailySalesSummaryDTO(java.util.Date utilDate, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(utilDate != null ? new java.sql.Date(utilDate.getTime()).toLocalDate() : null, customerName, revenue, cost, profit, itemsSold);
	}
}