package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.supervisor.domain.model.Trip;

import java.util.Optional;
import java.util.UUID;

public interface TripRepository {
    Trip save(Trip trip);
    Optional<Trip> findById(UUID id);
}