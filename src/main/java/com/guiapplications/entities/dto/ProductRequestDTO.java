package com.guiapplications.entities.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductRequestDTO(
		@NotBlank(message = "O nome do produto é obrigatório")
	    @Size(max = 150, message = "O nome deve ter no máximo 150 caracteres")
	    String name,

	    @Min(value = 0, message = "A quantidade não pode ser negativa")
	    Integer quantity,

	    @Future(message = "A data de validade deve ser uma data futura")
	    LocalDate expirationDate,

	    @PositiveOrZero(message = "O preço de compra não pode ser negativo")
	    BigDecimal purchasePrice,

	    @NotNull(message = "O preço de venda é obrigatório")
	    @Positive(message = "O preço de venda deve ser maior que zero")
	    BigDecimal sellingPrice,
	    
	    @NotNull(message = "A família é obrigatória")
	    Long familyId,
	    
	    @NotNull(message = "A marca é obrigatória")
	    Long brandId,

	    @NotNull(message = "A categoria é obrigatória")
	    Long categoryId
		
) {}