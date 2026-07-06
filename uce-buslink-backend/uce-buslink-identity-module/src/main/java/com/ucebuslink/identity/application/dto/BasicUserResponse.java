package com.ucebuslink.identity.application.dto;

import java.util.UUID;

public record BasicUserResponse(
    UUID id,
    String firstName,
    String lastName
) {}
