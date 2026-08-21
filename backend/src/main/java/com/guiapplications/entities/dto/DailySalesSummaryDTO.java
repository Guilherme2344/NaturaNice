package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DailySalesSummaryDTO(
		LocalDateTime date,
		String customerName,
		BigDecimal revenue,
		BigDecimal cost,
		BigDecimal profit,
		long itemsSold
) {
	public DailySalesSummaryDTO(java.sql.Timestamp sqlTimestamp, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(sqlTimestamp != null ? sqlTimestamp.toLocalDateTime() : null, customerName, revenue, cost, profit, itemsSold);
	}

	public DailySalesSummaryDTO(java.util.Date utilDate, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(utilDate != null ? new java.sql.Timestamp(utilDate.getTime()).toLocalDateTime() : null, customerName, revenue, cost, profit, itemsSold);
	}
}