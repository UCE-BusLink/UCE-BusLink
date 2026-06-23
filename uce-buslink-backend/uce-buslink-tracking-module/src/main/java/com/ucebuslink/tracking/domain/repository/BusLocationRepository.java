package com.ucebuslink.tracking.domain.repository;

import com.ucebuslink.tracking.domain.model.BusLocation;

import java.util.Optional;
import java.util.UUID;

public interface BusLocationRepository {
    // Guarda la data JSON y actualiza el índice geoespacial
    void saveLocation(BusLocation location);
    
    // Obtiene la ubicación exacta en formato JSON
    Optional<BusLocation> getLocationByBusId(UUID busId);
    
    // Elimina el bus de Redis (útil cuando el viaje termina)
    void removeLocation(UUID busId);
}