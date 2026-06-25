package com.ucebuslink.identity.application.dto;

import com.ucebuslink.shared.constant.Role;
import com.ucebuslink.shared.constant.UserStatus;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    Role role,
    UserStatus status
) {}