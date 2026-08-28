package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProductRequestDTO(
    String name,
    Integer quantity,
    LocalDate expirationDate,
    BigDecimal purchasePrice,
    BigDecimal sellingPrice,
    UUID brandId,
    String brandName,
    UUID categoryId,
    String categoryName,
    UUID familyId,
    String familyName
) {}