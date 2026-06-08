package com.ucebuslink.shared.dto;

public record RegisterRequest(
        String firstName,
        String lastName,
        String email,
        String password
) {}
