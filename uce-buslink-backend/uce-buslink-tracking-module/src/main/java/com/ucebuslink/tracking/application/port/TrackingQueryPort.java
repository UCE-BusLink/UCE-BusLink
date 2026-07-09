package com.ucebuslink.tracking.application.port;

import java.util.List;
import java.util.UUID;

/**
 * Output port. The Fleet and Reservations modules must implement
 * this interface to respond to Tracking without coupling the databases.
 */
public interface TrackingQueryPort {

    // Asks the Fleet Module: "What trip is this bus doing right now?"
    UUID getActiveTripIdByBus(UUID busId);

    // Asks the Reservations Module: "Does this student have an active reservation on this trip?"
    boolean hasActiveReservation(UUID userId, UUID tripId);

    // Simplification for the Haversine formula (the full stop object could be brought instead)
    // Returns an array: [latitude, longitude] of the next stop, or null if there isn't one.
    double[] getNextStopCoordinates(UUID tripId);
    String getNextStopName(UUID tripId);

    String getBusPlateNumber(UUID busId);
    String getRouteNameByTrip(UUID tripId);
    int getTripOccupiedSeats(UUID tripId);
    int getBusTotalCapacity(UUID busId);

    List<UUID> getUnboardedStudentIdsByTrip(UUID tripId);
    int getBoardedStudentCount(UUID tripId);
}