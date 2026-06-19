package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.supervisor.domain.model.Stop;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StopRepository {
    Stop save(Stop stop);
    Optional<Stop> findById(UUID id);
    List<Stop> findAllActive();
    List<Stop> saveAll(List<Stop> stops);
}