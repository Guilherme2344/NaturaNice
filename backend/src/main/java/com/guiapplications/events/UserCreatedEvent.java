package com.guiapplications.events;

public record UserCreatedEvent(String name, String email, String tempPassword) {}
