package com.ucebuslink.supervisor.domain.repository;

import com.ucebuslink.supervisor.domain.model.Bus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.ucebuslink.shared.dto.PageResponse;

public interface BusRepository {
    Bus save(Bus bus);
    Optional<Bus> findById(UUID id);
    Optional<Bus> findByPlateNumber(String plateNumber);
    List<Bus> findAllActive();
    void deleteById(UUID id);

    PageResponse<Bus> findAllActive(int page, int size);

    PageResponse<Bus> findAll(int page, int size);
}