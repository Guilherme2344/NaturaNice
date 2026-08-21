package com.guiapplications.events;

public record PasswordResetRequestedEvent(String email, String code) {}
