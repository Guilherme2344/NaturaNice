package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailySalesSummaryDTO(
		LocalDate date,
		BigDecimal revenue,
		BigDecimal cost,
		BigDecimal profit,
		long itemsSold
) {
	public DailySalesSummaryDTO(java.sql.Date sqlDate, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(sqlDate != null ? sqlDate.toLocalDate() : null, revenue, cost, profit, itemsSold);
	}

	public DailySalesSummaryDTO(java.util.Date utilDate, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(utilDate != null ? new java.sql.Date(utilDate.getTime()).toLocalDate() : null, revenue, cost, profit, itemsSold);
	}
}