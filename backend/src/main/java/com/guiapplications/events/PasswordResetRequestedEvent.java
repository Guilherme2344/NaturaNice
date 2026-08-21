package com.guiapplications.events;

// DTO record representing a password reset request event
public record PasswordResetRequestedEvent(String email, String code) {}
