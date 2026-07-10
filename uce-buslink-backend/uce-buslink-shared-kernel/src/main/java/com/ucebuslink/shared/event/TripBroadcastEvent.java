package com.ucebuslink.shared.event;

import com.ucebuslink.shared.constant.TripState;

import java.time.LocalDateTime;
import java.util.UUID;

// Carries the full, already-computed trip representation so every connected
// client (student/driver/admin) can apply the change directly to its local
// cache over WebSocket, without an extra REST round-trip.
public record TripBroadcastEvent(
    ChangeType changeType,
    UUID tripId,
    UUID routeId,
    UUID busId,
    UUID driverId,
    TripState state,
    LocalDateTime departureTime,
    LocalDateTime estimatedArrivalTime,
    Integer availableSeats
) {
    public enum ChangeType { CREATED, UPDATED, STATE_CHANGED, CANCELLED }
}
