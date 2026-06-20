package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.stop.ChangeStopStatusCommand;
import com.ucebuslink.supervisor.application.dto.stop.CreateStopCommand;
import com.ucebuslink.supervisor.application.dto.stop.StopResponse;
import com.ucebuslink.supervisor.application.dto.stop.UpdateStopCommand;
import com.ucebuslink.supervisor.application.usecase.ManageStopUseCase;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
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
    private final RouteRepository routeRepository;

    public StopApplicationService(StopRepository stopRepository, RouteRepository routeRepository) {
        this.stopRepository = stopRepository;
        this.routeRepository = routeRepository;
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

    @Override
    @Transactional
    public void deleteStop(UUID id) {

        Stop stop = stopRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Stop not found with id: " + id));

        stop.setIsActive(false);
        stop.setDeletedAt(LocalDateTime.now());

        stopRepository.save(stop);

        routeRepository.removeStopFromRoutes(id);
    }

    @Override
    @Transactional
    public List<StopResponse> createStopsBatch(List<CreateStopCommand> commands) {
        
        List<Stop> stopsToSave = commands.stream().map(command -> {
            Stop stop = new Stop();
            stop.setName(command.name());
            stop.setLatitude(command.latitude());
            stop.setLongitude(command.longitude());
            stop.setIsActive(true);
            stop.setCreatedAt(LocalDateTime.now());
            return stop;
        }).collect(Collectors.toList());

        List<Stop> savedStops = stopRepository.saveAll(stopsToSave);

        return savedStops.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<StopResponse> getAllStops(boolean isActive, int page, int size){

        PageResponse<Stop> domainPage = stopRepository.findAllStops(isActive, page, size);

        List<StopResponse> Dto = domainPage.content().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(Dto, domainPage.pageNumber(), domainPage.pageSize(), domainPage.totalElements(), domainPage.totalPages());
    }

    @Override
    public StopResponse changeStatus(UUID id, ChangeStopStatusCommand command) {

        Stop stop = stopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stop not found"));

        stop.setIsActive(command.isActive());

        stopRepository.save(stop);

        return mapToResponse(stop);
    }
}