package com.ucebuslink.tracking.domain.repository;

import com.ucebuslink.tracking.domain.model.BusLocation;

import java.util.Optional;
import java.util.UUID;

public interface BusLocationRepository {
    // Saves the JSON data and updates the geospatial index
    void saveLocation(BusLocation location);

    // Retrieves the exact location in JSON format
    Optional<BusLocation> getLocationByBusId(UUID busId);

    // Removes the bus from Redis (useful when the trip ends)
    void removeLocation(UUID busId);
}