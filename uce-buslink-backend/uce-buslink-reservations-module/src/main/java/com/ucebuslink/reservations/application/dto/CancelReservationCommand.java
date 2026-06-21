package com.ucebuslink.reservations.application.dto;

import java.util.UUID;

public record CancelReservationCommand(
    UUID userId,
    String reason
) {}