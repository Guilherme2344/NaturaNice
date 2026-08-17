package com.guiapplications.entities;

import java.time.LocalDateTime;
import java.util.List;

import com.guiapplications.entities.dto.DailySalesSummaryDTO;
import com.guiapplications.entities.dto.MonthlySalesSummaryDTO;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class Sale extends PanacheEntity {
	public LocalDateTime saleDate;
	
	@OneToMany(mappedBy = "sale", cascade = CascadeType.ALL)
	public List<SaleItem> items;
	
	// daily sales summary
    public static List<DailySalesSummaryDTO> getDailySummaries(LocalDateTime start, LocalDateTime end) {
        String jpql = "SELECT new com.guiapplications.entities.dto.DailySalesSummaryDTO(" +
                      "  CAST(s.saleDate AS date), " +
                      "  SUM(i.sellingPrice * i.quantity), " +
                      "  SUM(i.purchasePrice * i.quantity), " +
                      "  SUM((i.sellingPrice - i.purchasePrice) * i.quantity), " +
                      "  SUM(i.quantity) " +
                      ") " +
                      "FROM SaleItem i JOIN i.sale s " +
                      "WHERE s.saleDate >= :start AND s.saleDate <= :end " +
                      "GROUP BY CAST(s.saleDate AS date) " +
                      "ORDER BY CAST(s.saleDate AS date) ASC";

        return getEntityManager()
                .createQuery(jpql, DailySalesSummaryDTO.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }
    
    // monthly summary
    public static List<MonthlySalesSummaryDTO> getMonthlySummaries(LocalDateTime start, LocalDateTime end) {
        String jpql = "SELECT new com.guiapplications.entities.dto.MonthlySalesSummaryDTO(" +
                      "  MONTH(s.saleDate), " +
                      "  SUM(i.sellingPrice * i.quantity), " +
                      "  SUM(i.purchasePrice * i.quantity), " +
                      "  SUM((i.sellingPrice - i.purchasePrice) * i.quantity), " +
                      "  SUM(i.quantity) " +
                      ") " +
                      "FROM SaleItem i JOIN i.sale s " +
                      "WHERE s.saleDate >= :start AND s.saleDate <= :end " +
                      "GROUP BY MONTH(s.saleDate) " +
                      "ORDER BY MONTH(s.saleDate) ASC";

        return getEntityManager()
                .createQuery(jpql, MonthlySalesSummaryDTO.class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }
}
