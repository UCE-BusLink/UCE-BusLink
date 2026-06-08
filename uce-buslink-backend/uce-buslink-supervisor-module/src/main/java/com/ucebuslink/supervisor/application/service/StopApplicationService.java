package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.StopResponse;
import com.ucebuslink.supervisor.application.dto.UpdateStopCommand;
import com.ucebuslink.supervisor.application.usecase.ManageStopUseCase;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StopApplicationService implements ManageStopUseCase {

    private final StopRepository stopRepository;

    public StopApplicationService(StopRepository stopRepository) {
        this.stopRepository = stopRepository;
    }

    @Override
    @Transactional
    public StopResponse createStop(CreateStopCommand command) {
        Stop stop = new Stop();
        stop.setName(command.name());
        stop.setLatitude(command.latitude());
        stop.setLongitude(command.longitude());
        stop.setIsActive(true);
        stop.setCreatedAt(LocalDateTime.now());

        Stop savedStop = stopRepository.save(stop);
        return mapToResponse(savedStop);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StopResponse> getAllActiveStops() {
        return stopRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private StopResponse mapToResponse(Stop stop) {
        return new StopResponse(
                stop.getId(),
                stop.getName(),
                stop.getLatitude(),
                stop.getLongitude(),
                stop.getIsActive()
        );
    }

    @Override
    @Transactional
    public StopResponse updateStop(UUID id, UpdateStopCommand command) {
        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stop not found with id: " + id));

        stop.setName(command.name());
        stop.setLatitude(command.latitude());
        stop.setLongitude(command.longitude());

        return mapToResponse(stopRepository.save(stop));
    }
}