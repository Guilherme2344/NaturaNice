package com.guiapplications.entities.dto;

import com.guiapplications.entities.Customer;

public record CustomerResponseDTO(
    Long id,
    String name
) {
    // converts entity to DTO
    public static CustomerResponseDTO fromEntity(Customer customer) {
        return new CustomerResponseDTO(
            customer.id,
            customer.name
        );
    }
}
