package com.guiapplications.events;

// DTO record representing a user creation event
public record UserCreatedEvent(String name, String email, String tempPassword) {}
