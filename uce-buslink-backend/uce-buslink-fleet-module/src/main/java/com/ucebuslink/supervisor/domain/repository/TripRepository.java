package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.shared.constant.TripState;
import com.ucebuslink.supervisor.domain.model.Trip;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TripRepository {
    Trip save(Trip trip);
    Optional<Trip> findById(UUID id);
    Page<Trip> findAll(Pageable pageable);

    Page<Trip> findByState(TripState state, Pageable pageable);
    Page<Trip> findByRouteId(UUID routeId, Pageable pageable);
    Page<Trip> findByDriverId(UUID driverId, Pageable pageable);
}