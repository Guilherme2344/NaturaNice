package com.guiapplications.entities.dto;

public record VerifyCodeRequestDTO(
    String email,
    String code
) {}
