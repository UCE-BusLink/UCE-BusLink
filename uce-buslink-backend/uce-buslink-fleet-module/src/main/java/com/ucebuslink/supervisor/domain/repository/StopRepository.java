package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.StopJpaEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StopRepository {
    Stop save(Stop stop);
    Optional<Stop> findById(UUID id);
    List<Stop> findAllActive();
    List<Stop> saveAll(List<Stop> stops);

    PageResponse<Stop> findAllStops(boolean isActive, int page, int size);

    StopJpaEntity getReferenceById(UUID id);
}