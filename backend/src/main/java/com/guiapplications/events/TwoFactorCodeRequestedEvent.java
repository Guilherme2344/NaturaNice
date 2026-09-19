package com.guiapplications.events;

// DTO record representing a two-factor authentication code request event
public record TwoFactorCodeRequestedEvent(String email, String code) {}
