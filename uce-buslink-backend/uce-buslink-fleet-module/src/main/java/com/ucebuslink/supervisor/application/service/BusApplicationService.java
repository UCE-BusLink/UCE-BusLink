package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.application.dto.bus.BusResponse;
import com.ucebuslink.supervisor.application.dto.bus.ChangeBusStatusCommand;
import com.ucebuslink.supervisor.application.dto.bus.CreateBusCommand;
import com.ucebuslink.supervisor.application.dto.bus.UpdateBusCommand;
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
    
    /*
    @Override
    @Transactional(readOnly = true)
    public List<BusResponse> getAllActiveBuses() {
        return busRepository.findAllActive().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    */

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BusResponse> getAllActiveBuses(int page, int size) {
        PageResponse<Bus> domainPage = busRepository.findAllActive(page, size);
        
        List<BusResponse> dtos = domainPage.content().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PageResponse<>(dtos, domainPage.pageNumber(), domainPage.pageSize(), domainPage.totalElements(), domainPage.totalPages());
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

    @Override
    @Transactional
    public BusResponse updateBus(UUID id, UpdateBusCommand command) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));

        bus.setPlateNumber(command.plateNumber());
        bus.setInternalCode(command.internalCode());
        bus.setSeatCapacity(command.seatCapacity());
        bus.setManufacturer(command.manufacturer());
        bus.setModel(command.model());
        // bus.setManufacturingYear(command.manufacturingYear()); // Si añadiste el setter en la US anterior

        return mapToResponse(busRepository.save(bus));
    }

    @Override
    @Transactional
    public BusResponse changeBusStatus(UUID id, ChangeBusStatusCommand command) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found with id: " + id));

        bus.setOperationalStatus(command.status());
        return mapToResponse(busRepository.save(bus));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BusResponse> findAll(int page, int size) {
        PageResponse<Bus> domainPage = busRepository.findAll(page, size);
        
        List<BusResponse> dtos = domainPage.content().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PageResponse<>(dtos, domainPage.pageNumber(), domainPage.pageSize(), domainPage.totalElements(), domainPage.totalPages());
    }
}