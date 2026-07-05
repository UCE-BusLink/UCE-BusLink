package com.ucebuslink.shared.dto;

public record CurrentUserResponse(
    String id,
    String email,
    String firstName,
    String lastName,
    String role,
    boolean needsOnboarding
) {}