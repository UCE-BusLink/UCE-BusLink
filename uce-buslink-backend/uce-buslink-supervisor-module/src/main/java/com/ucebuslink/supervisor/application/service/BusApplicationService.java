package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.BusResponse;
import com.ucebuslink.supervisor.application.dto.CreateBusCommand;
import com.ucebuslink.supervisor.application.usecase.ManageBusUseCase;
import com.ucebuslink.supervisor.domain.model.Bus;
import com.ucebuslink.supervisor.domain.model.BusStatus;
import com.ucebuslink.supervisor.domain.repository.BusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BusApplicationService implements ManageBusUseCase {

    private final BusRepository busRepository;

    public BusApplicationService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    @Override
    @Transactional
    public BusResponse createBus(CreateBusCommand command) {
        Bus bus = new Bus();
        bus.setPlateNumber(command.plateNumber());
        bus.setInternalCode(command.internalCode());
        bus.setSeatCapacity(command.seatCapacity());
        bus.setManufacturer(command.manufacturer());
        bus.setModel(command.model());
        bus.setOperationalStatus(BusStatus.OPERATIONAL);

        Bus savedBus = busRepository.save(bus);
        return mapToResponse(savedBus);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusResponse> getAllActiveBuses() {
        return busRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BusResponse getBusById(UUID id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id)); // Idealmente, usar una custom exception
        return mapToResponse(bus);
    }

    @Override
    @Transactional
    public void deleteBus(UUID id) {
        busRepository.deleteById(id);
    }

    private BusResponse mapToResponse(Bus bus) {
        return new BusResponse(
                bus.getId(),
                bus.getPlateNumber(),
                bus.getInternalCode(),
                bus.getSeatCapacity(),
                bus.getManufacturer(),
                bus.getModel(),
                bus.getOperationalStatus()
        );
    }
}