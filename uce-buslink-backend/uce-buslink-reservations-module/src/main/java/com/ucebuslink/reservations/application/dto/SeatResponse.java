package com.ucebuslink.reservations.application.dto;

import com.ucebuslink.shared.constant.*;
import java.util.UUID;

public record SeatResponse(
    UUID id,
    UUID tripId,
    Integer seatNumber,
    SeatState state
) {}