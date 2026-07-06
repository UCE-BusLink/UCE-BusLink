package com.ucebuslink.reservations.application.dto;

import com.ucebuslink.shared.constant.ReservationStatus;
import java.util.UUID;

public record DriverPassengerResponse(
    UUID reservationId,
    UUID tripId,
    UUID seatId,
    ReservationStatus status,
    UUID boardingStopId,
    String studentName
) {}
