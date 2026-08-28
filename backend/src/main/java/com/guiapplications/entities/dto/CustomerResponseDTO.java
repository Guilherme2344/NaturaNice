package com.guiapplications.entities.dto;

import java.util.UUID;
import com.guiapplications.entities.Customer;

public record CustomerResponseDTO(
    UUID id,
    String name,
    boolean canDelete
) {
    public static CustomerResponseDTO fromEntity(Customer customer, boolean canDelete) {
        return new CustomerResponseDTO(
            customer.id,
            customer.name,
            canDelete
        );
    }

    public static CustomerResponseDTO fromEntity(Customer customer) {
        return fromEntity(customer, true);
    }
}
