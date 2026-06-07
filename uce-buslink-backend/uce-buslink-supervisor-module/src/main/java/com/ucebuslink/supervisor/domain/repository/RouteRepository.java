package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.supervisor.domain.model.Route;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RouteRepository {
    Route save(Route route);
    Optional<Route> findById(UUID id);
    List<Route> findAllActive();
    void deleteById(UUID id);
}