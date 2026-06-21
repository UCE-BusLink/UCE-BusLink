package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.trip.ChangeTripStateCommand;
import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.dto.trip.UpdateTripCommand;
import com.ucebuslink.supervisor.application.usecase.ManageTripUseCase;
import com.ucebuslink.supervisor.domain.model.Bus;
import com.ucebuslink.supervisor.domain.model.Schedule;
import com.ucebuslink.supervisor.domain.model.Trip;
import com.ucebuslink.shared.constant.*;
import com.ucebuslink.shared.event.TripCreatedEvent;
import com.ucebuslink.supervisor.domain.repository.BusRepository;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.ScheduleRepository;
import com.ucebuslink.supervisor.domain.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final ScheduleRepository scheduleRepository;
    private final ApplicationEventPublisher eventPublisher;

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

            validateDepartureAgainstSchedule(command.routeId(), departure);
            
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

            eventPublisher.publishEvent(new TripCreatedEvent(savedTrip.getId(), bus.getSeatCapacity()));
            
            responses.add(new TripResponse(
                    savedTrip.getId(), savedTrip.getRouteId(), savedTrip.getBusId(),
                    savedTrip.getDriverId(), savedTrip.getState(), savedTrip.getDepartureTime(),
                    savedTrip.getEstimatedArrivalTime(), savedTrip.getAvailableSeats()
            ));
        }

        log.info("[FLEET-TRIP] Se programaron {} viajes exitosamente.", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripById(UUID id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + id));
        return mapToResponse(trip);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TripResponse> getAllTrips(int page, int size) {
        return tripRepository.findAll(PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public TripResponse updateTrip(UUID id, UpdateTripCommand command) {
        log.info("[FLEET-TRIP] Iniciando actualización para viaje ID: {}", id);

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + id));

        // Validación de negocio: Solo se puede editar si no ha empezado
        if (trip.getState() != TripState.SCHEDULED) {
            log.warn("[FLEET-TRIP] Intento de editar viaje en estado {} denegado (ID: {})", trip.getState(), id);
            throw new IllegalStateException("Solo se pueden editar viajes en estado SCHEDULED.");
        }

        validateDepartureAgainstSchedule(command.routeId(), command.departureTime());

        Bus bus = busRepository.findById(command.busId())
                .orElseThrow(() -> new IllegalArgumentException("El bus especificado no existe."));

        com.ucebuslink.supervisor.domain.model.Route route = routeRepository.findById(command.routeId())
                .orElseThrow(() -> new IllegalArgumentException("La ruta especificada no existe."));

        // Aplicamos los cambios
        trip.setRouteId(command.routeId());
        trip.setBusId(command.busId());
        trip.setDriverId(command.driverId());
        trip.setDepartureTime(command.departureTime());
        
        // Recalculamos tiempos y asientos en caso de que hayan cambiado de ruta o bus
        trip.setEstimatedArrivalTime(command.departureTime().plusMinutes(route.getEstimatedDurationMinutes()));
        trip.setAvailableSeats(bus.getSeatCapacity());

        Trip updatedTrip = tripRepository.save(trip);
        log.info("[FLEET-TRIP] Viaje actualizado exitosamente. Nuevo bus asignado: {}", updatedTrip.getBusId());
        
        return mapToResponse(updatedTrip);
    }

    private TripResponse mapToResponse(Trip trip) {
        return new TripResponse(
                trip.getId(), trip.getRouteId(), trip.getBusId(),
                trip.getDriverId(), trip.getState(), trip.getDepartureTime(),
                trip.getEstimatedArrivalTime(), trip.getAvailableSeats()
        );
    }

    private void validateDepartureAgainstSchedule(UUID routeId, LocalDateTime departureTime) {

        List<Schedule> schedules = scheduleRepository.findByRouteId(routeId);

        if (schedules.isEmpty()) {
            throw new IllegalArgumentException(
                    "No hay horarios (Schedule) configurados para esta ruta.");
        }

        String targetDay = departureTime.getDayOfWeek().name();
        LocalTime targetTime = departureTime.toLocalTime();

        boolean isValid = schedules.stream()
                .filter(Schedule::isActive)
                .anyMatch(schedule ->
                        schedule.getDetails().stream().anyMatch(detail -> {

                            boolean hasDay = detail.getDaysOfWeek().stream()
                                    .anyMatch(day -> day.toString().equals(targetDay));

                            if (!hasDay) {
                                return false;
                            }

                            if (detail.getType() != null &&
                                    detail.getType().name().equals("FIXED")) {

                                return detail.getFixedDepartureTimes()
                                        .contains(targetTime);
                            }

                            return detail.getFrequencyStartTime() != null
                                    && detail.getFrequencyEndTime() != null
                                    && !targetTime.isBefore(detail.getFrequencyStartTime())
                                    && !targetTime.isAfter(detail.getFrequencyEndTime());
                        })
                );

        if (!isValid) {
            throw new IllegalArgumentException(
                    "La fecha/hora " + departureTime +
                    " no coincide con los días y horas permitidos en los horarios de la ruta.");
        }
    }

    @Override
    @Transactional
    public void cancelTrip(UUID id) {
        log.info("[FLEET-TRIP] Intentando cancelar lógicamente el viaje ID: {}", id);
        
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + id));

        if (trip.getState() == TripState.COMPLETED || trip.getState() == TripState.CANCELLED) {
            throw new IllegalStateException("El viaje ya está completado o previamente cancelado.");
        }

        trip.setState(TripState.CANCELLED);
        trip.setCancelledAt(LocalDateTime.now());
        trip.setDeletedAt(LocalDateTime.now()); // Borrado lógico para ocultarlo de listados comunes

        tripRepository.save(trip);
        log.info("[FLEET-TRIP] Viaje ID: {} cancelado exitosamente.", id);
    }

    @Override
    @Transactional
    public TripResponse changeTripState(UUID id, ChangeTripStateCommand command) {
        log.info("[FLEET-TRIP] Cambiando estado del viaje ID: {} a {}", id, command.newState());
        
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Viaje no encontrado con ID: " + id));

        TripState currentState = trip.getState();
        TripState newState = command.newState();

        if (currentState == newState) {
            return mapToResponse(trip);
        }

        if (currentState == TripState.CANCELLED || currentState == TripState.COMPLETED) {
            throw new IllegalStateException("No se puede cambiar el estado de un viaje finalizado o cancelado.");
        }

        // Validación de transiciones permitidas
        if (newState == TripState.ONGOING && currentState == TripState.SCHEDULED) {
            trip.setState(TripState.ONGOING);
            trip.setStartedAt(LocalDateTime.now());
        } else if (newState == TripState.COMPLETED && currentState == TripState.ONGOING) {
            trip.setState(TripState.COMPLETED);
            trip.setCompletedAt(LocalDateTime.now());
            trip.setActualArrivalTime(LocalDateTime.now());
        } else {
            throw new IllegalStateException("Transición de estado inválida: de " + currentState + " a " + newState);
        }

        Trip updatedTrip = tripRepository.save(trip);
        return mapToResponse(updatedTrip);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TripResponse> getTripsByState(TripState state, int page, int size) {
        return tripRepository.findByState(state, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TripResponse> getTripsByRouteId(UUID routeId, int page, int size) {
        return tripRepository.findByRouteId(routeId, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TripResponse> getTripsByDriverId(UUID driverId, int page, int size) {
        return tripRepository.findByDriverId(driverId, PageRequest.of(page, size))
                .map(this::mapToResponse);
    }
}