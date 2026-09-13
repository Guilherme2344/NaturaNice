package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProductBatchRequestDTO(
    @NotNull(message = "O ID do produto é obrigatório")
    UUID productId,
    
    @NotNull(message = "A quantidade do lote é obrigatória")
    @Min(value = 1, message = "A quantidade do lote deve ser no mínimo 1")
    Integer quantity,
    
    LocalDate purchaseDate,
    LocalDate expirationDate,
    BigDecimal purchasePrice,
    
    @NotNull(message = "O preço de venda é obrigatório")
    BigDecimal sellingPrice
) {}
