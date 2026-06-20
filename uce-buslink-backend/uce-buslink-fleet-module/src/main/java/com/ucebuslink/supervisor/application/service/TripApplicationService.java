package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.usecase.ManageTripUseCase;
import com.ucebuslink.supervisor.domain.model.Bus;
import com.ucebuslink.supervisor.domain.model.Trip;
import com.ucebuslink.shared.constant.*;
import com.ucebuslink.supervisor.domain.repository.BusRepository;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripApplicationService implements ManageTripUseCase {

    private final TripRepository tripRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;

    @Override
    @Transactional
    public List<TripResponse> createTrip(CreateTripCommand command) {
        log.info("[FLEET-TRIP] Iniciando validación para crear viajes por lote. Bus: {}, Ruta: {}", 
                command.busId(), command.routeId());

        Bus bus = busRepository.findById(command.busId())
                .orElseThrow(() -> new IllegalArgumentException("El bus especificado no existe."));

        com.ucebuslink.supervisor.domain.model.Route route = routeRepository.findById(command.routeId())
                .orElseThrow(() -> new IllegalArgumentException("La ruta especificada no existe."));

        List<TripResponse> responses = new ArrayList<>();

        // Iterar sobre cada fecha y hora enviada desde el calendario del frontend
        for (java.time.LocalDateTime departure : command.departures()) {
            
            // TODO: Agregar validación para verificar que el Bus/Conductor no tengan otro viaje cruzado en esta misma hora.

            Trip trip = new Trip();
            trip.setId(UUID.randomUUID());
            trip.setRouteId(command.routeId());
            trip.setBusId(command.busId());
            trip.setDriverId(command.driverId());
            trip.setState(TripState.SCHEDULED);
            
            // Asignar salida y calcular llegada
            trip.setDepartureTime(departure);
            trip.setEstimatedArrivalTime(departure.plusMinutes(route.getEstimatedDurationMinutes()));
            trip.setAvailableSeats(bus.getSeatCapacity());

            Trip savedTrip = tripRepository.save(trip);
            
            responses.add(new TripResponse(
                    savedTrip.getId(), savedTrip.getRouteId(), savedTrip.getBusId(),
                    savedTrip.getDriverId(), savedTrip.getState(), savedTrip.getDepartureTime(),
                    savedTrip.getEstimatedArrivalTime(), savedTrip.getAvailableSeats()
            ));
        }

        log.info("[FLEET-TRIP] Se programaron {} viajes exitosamente.", responses.size());
        return responses;
    }
}