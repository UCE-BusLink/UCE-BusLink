package com.ucebuslink.reservations.application.dto;

import com.ucebuslink.shared.constant.*;
import java.util.UUID;

public record ReservationResponse(
    UUID id,
    UUID tripId,
    UUID seatId,
    ReservationStatus status,
    String qrCode
) {}