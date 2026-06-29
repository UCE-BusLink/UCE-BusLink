package com.ucebuslink.supervisor.application.port.out;

import java.util.List;
import java.util.UUID;

public interface FleetToReservationPort {
    List<UUID> getStudentIdsByTrip(UUID tripId);
}