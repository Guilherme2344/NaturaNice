package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DailySalesSummaryDTO(
		LocalDateTime date,
		String productName,
		String customerName,
		BigDecimal revenue,
		BigDecimal cost,
		BigDecimal profit,
		long itemsSold,
		Boolean isPersonalUse,
		String observation
) {
	public DailySalesSummaryDTO(LocalDateTime date, String productName, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(date, productName, customerName, revenue, cost, profit, itemsSold, false, null);
	}

	public DailySalesSummaryDTO(LocalDateTime date, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold) {
		this(date, "Produto não informado", customerName, revenue, cost, profit, itemsSold, false, null);
	}

	public DailySalesSummaryDTO(java.sql.Timestamp sqlTimestamp, String productName, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold, Boolean isPersonalUse, String observation) {
		this(sqlTimestamp != null ? sqlTimestamp.toLocalDateTime() : null, productName, customerName, revenue, cost, profit, itemsSold, isPersonalUse, observation);
	}

	public DailySalesSummaryDTO(java.sql.Timestamp sqlTimestamp, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold, Boolean isPersonalUse, String observation) {
		this(sqlTimestamp != null ? sqlTimestamp.toLocalDateTime() : null, "Produto não informado", customerName, revenue, cost, profit, itemsSold, isPersonalUse, observation);
	}

	public DailySalesSummaryDTO(java.util.Date utilDate, String productName, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold, Boolean isPersonalUse, String observation) {
		this(utilDate != null ? new java.sql.Timestamp(utilDate.getTime()).toLocalDateTime() : null, productName, customerName, revenue, cost, profit, itemsSold, isPersonalUse, observation);
	}

	public DailySalesSummaryDTO(java.util.Date utilDate, String customerName, BigDecimal revenue, BigDecimal cost, BigDecimal profit, long itemsSold, Boolean isPersonalUse, String observation) {
		this(utilDate != null ? new java.sql.Timestamp(utilDate.getTime()).toLocalDateTime() : null, "Produto não informado", customerName, revenue, cost, profit, itemsSold, isPersonalUse, observation);
	}
}