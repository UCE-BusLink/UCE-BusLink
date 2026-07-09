package com.ucebuslink.shared.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDriverRequest(
    // Field names kept in Spanish (nombres/apellidos): renaming them would break the
    // frontend contract, which sends the request body with these exact JSON keys.
    @NotBlank(message = "First name is required")
    String nombres,

    @NotBlank(message = "Last name is required")
    String apellidos,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Temporary password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    String password
) {}