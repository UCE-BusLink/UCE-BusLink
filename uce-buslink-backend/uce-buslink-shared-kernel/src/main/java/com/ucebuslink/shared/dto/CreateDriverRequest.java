package com.ucebuslink.shared.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDriverRequest(
    @NotBlank(message = "Los nombres son obligatorios")
    String nombres,

    @NotBlank(message = "Los apellidos son obligatorios")
    String apellidos,

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo inválido")
    String email,

    @NotBlank(message = "La contraseña temporal es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    String password
) {}