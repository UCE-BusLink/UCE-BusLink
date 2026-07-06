package com.ucebuslink.supervisor.application.service;

import com.ucebuslink.supervisor.application.dto.trip.ChangeTripStateCommand;
import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.dto.trip.UpdateTripCommand;
import com.ucebuslink.supervisor.application.port.out.FleetToReservationPort;
import com.ucebuslink.supervisor.application.usecase.ManageTripUseCase;
import com.ucebuslink.supervisor.domain.model.Bus;
import com.ucebuslink.supervisor.domain.model.Schedule;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.model.Trip;
import com.ucebuslink.shared.constant.*;
import com.ucebuslink.shared.event.TripCancelledEvent;
import com.ucebuslink.shared.event.TripCompletedEvent;
import com.ucebuslink.shared.event.TripCreatedEvent;
import com.ucebuslink.shared.event.TripStartedEvent;
import com.ucebuslink.supervisor.domain.repository.BusRepository;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.domain.repository.ScheduleRepository;
import com.ucebuslink.supervisor.domain.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    private final FleetToReservationPort reservationPort;

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

    @Transactional
    public TripResponse getTripWithLock(UUID id) {
        log.debug("[FLEET-TRIP] Obteniendo viaje con PESSIMISTIC_WRITE lock: {}", id);
        Trip trip = tripRepository.findByIdWithLock(id)
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

        List<UUID> students = reservationPort.getStudentIdsByTrip(trip.getId());

        eventPublisher.publishEvent(
            new TripCancelledEvent(
                trip.getId(),
                trip.getDriverId(),
                students,
                "Viaje cancelado"
            )
        );

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
            if (LocalDateTime.now().isBefore(trip.getDepartureTime().minusMinutes(10))) {
                throw new IllegalStateException("No se puede iniciar el viaje antes de 10 minutos de la salida programada.");
            }
            trip.setState(TripState.ONGOING);
            trip.setStartedAt(LocalDateTime.now());

            List<UUID> students = reservationPort.getStudentIdsByTrip(trip.getId());
            eventPublisher.publishEvent(new TripStartedEvent(trip.getId(), students));

        } else if (newState == TripState.COMPLETED && currentState == TripState.ONGOING) {
            trip.setState(TripState.COMPLETED);
            trip.setCompletedAt(LocalDateTime.now());
            trip.setActualArrivalTime(LocalDateTime.now());

            List<UUID> students = reservationPort.getStudentIdsByTrip(trip.getId());
            eventPublisher.publishEvent(new TripCompletedEvent(trip.getId(), students));
            
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

    @Transactional(readOnly = true)
    public UUID getActiveTripIdByBus(UUID busId) {
        log.debug("[FLEET-TRIP] Consultando viaje activo para el bus {}", busId);
        
        // Buscamos entre los viajes ONGOING cuál le pertenece a este bus
        // Usamos la primera página asumiendo que un bus no tiene 2 viajes activos al mismo tiempo
        Page<TripResponse> ongoingTrips = getTripsByState(TripState.ONGOING, 0, 50);
        
        return ongoingTrips.stream()
                .filter(trip -> trip.busId().equals(busId))
                .map(TripResponse::id)
                .findFirst()
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public String getBusPlateNumber(UUID busId) {
        log.debug("[FLEET-TRIP] Consultando placa del bus {}", busId);
        return busRepository.findById(busId)
                // Nota: Ajusta ".getPlate()" si tu entidad Bus usa otro nombre (ej. getPlateNumber)
                .map(Bus::getPlateNumber) 
                .orElse("Desconocido");
    }

    @Transactional(readOnly = true)
    public int getBusTotalCapacity(UUID busId) {
        log.debug("[FLEET-TRIP] Consultando capacidad total del bus {}", busId);
        return busRepository.findById(busId)
                .map(Bus::getSeatCapacity) // Este getter lo vimos en tu código de creación de viajes
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public String getRouteNameByTrip(UUID tripId) {
        log.debug("[FLEET-TRIP] Consultando nombre de la ruta para el viaje {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> routeRepository.findById(trip.getRouteId()))
                // Nota: Ajusta ".getName()" si tu entidad Route usa otro nombre para el nombre de la ruta
                .map(com.ucebuslink.supervisor.domain.model.Route::getName) 
                .orElse("Ruta Desconocida");
    }

    @Transactional(readOnly = true)
    public int getTripOccupiedSeats(UUID tripId) {
        log.debug("[FLEET-TRIP] Consultando asientos ocupados para el viaje {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> busRepository.findById(trip.getBusId())
                        // Ocupados = Capacidad total - Asientos disponibles actualmente
                        .map(bus -> bus.getSeatCapacity() - trip.getAvailableSeats()))
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public double[] getNextStopCoordinates(UUID tripId) {
        log.debug("[FLEET-TRIP] Consultando coordenadas de la próxima parada para el viaje {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> routeRepository.findById(trip.getRouteId()))
                .filter(route -> route.getRouteStops() != null && !route.getRouteStops().isEmpty())
                .map(route -> {
                    // Obtenemos la parada inicial de la ruta basándonos en el orden
                    Stop nextStop = route.getRouteStops().stream()
                            .min((rs1, rs2) -> Integer.compare(rs1.getStopOrder(), rs2.getStopOrder()))
                            .orElseThrow()
                            .getStop();
                    return new double[]{nextStop.getLatitude(), nextStop.getLongitude()};
                })
                .orElse(null); // Retorna null si no hay paradas, el Haversine lo manejará
    }

    @Transactional(readOnly = true)
    public String getNextStopName(UUID tripId) {
        log.debug("[FLEET-TRIP] Consultando nombre de la próxima parada para el viaje {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> routeRepository.findById(trip.getRouteId()))
                .filter(route -> route.getRouteStops() != null && !route.getRouteStops().isEmpty())
                .map(route -> {
                    Stop nextStop = route.getRouteStops().stream()
                            .min((rs1, rs2) -> Integer.compare(rs1.getStopOrder(), rs2.getStopOrder()))
                            .orElseThrow()
                            .getStop();
                    return nextStop.getName();
                })
                .orElse("Parada Desconocida");
    }

    public Page<TripResponse> getTripsByDriverAndDate(UUID driverId, LocalDate date, int page, int size) {
        log.info("[APP-FLEET] Consultando viajes paginados para el chofer ID: {} en la fecha: {}", driverId, date);
        
        Pageable pageable = PageRequest.of(page, size);
        
        return tripRepository.findTripsByDriverAndDate(driverId, date, pageable)
                .map(this::mapToResponse);// Transforma Dominio a DTO manteniendo la estructura Page
    }

    /**
     * Tarea automática: Se ejecuta cada 1 minuto.
     * Busca viajes en estado SCHEDULED que tengan más de 30 minutos de retraso
     * (departureTime < (ahora - 30 mins)) y los cancela automáticamente.
     * También alerta si el viaje lleva retraso en múltiplos de 5 minutos (5, 10, 15...).
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkDelayedTrips() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cancelThreshold = now.minusMinutes(30);
        
        List<Trip> scheduledTrips = tripRepository.findByState(TripState.SCHEDULED, PageRequest.of(0, 500)).getContent();
        
        for (Trip trip : scheduledTrips) {
            if (trip.getDepartureTime().isBefore(cancelThreshold)) {
                log.warn("[FLEET-TRIP-JOB] Cancelando viaje retrasado (ID: {}) programado para {}", trip.getId(), trip.getDepartureTime());
                cancelTrip(trip.getId());
            } else {
                long diffMins = java.time.Duration.between(trip.getDepartureTime(), now).toMinutes();
                if (diffMins > 0 && diffMins % 5 == 0 && diffMins <= 30) {
                    log.info("[FLEET-TRIP-JOB] Alerta de demora para viaje (ID: {}) no iniciado", trip.getId());
                    eventPublisher.publishEvent(new com.ucebuslink.shared.event.TripDelayedEvent(
                            trip.getId(), trip.getDriverId(), "Lleva " + diffMins + " minutos de retraso para iniciar el viaje.", (int) diffMins));
                }
            }
        }
    }

    /**
     * Tarea automática: Se ejecuta cada 1 minuto.
     * Busca viajes en estado SCHEDULED que estén a exactamente 15, 10, 5 o 0 minutos
     * de iniciar y envía un recordatorio al conductor.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional(readOnly = true)
    public void remindUpcomingTrips() {
        LocalDateTime now = LocalDateTime.now();
        List<Trip> scheduledTrips = tripRepository.findByState(TripState.SCHEDULED, PageRequest.of(0, 500)).getContent();
        
        for (Trip trip : scheduledTrips) {
            long diffMins = java.time.Duration.between(now, trip.getDepartureTime()).toMinutes();
            
            if (diffMins == 15 || diffMins == 10 || diffMins == 5 || diffMins == 0) {
                log.info("[FLEET-TRIP-JOB] Recordatorio de viaje (ID: {}) en {} minutos", trip.getId(), diffMins);
                eventPublisher.publishEvent(new com.ucebuslink.shared.event.TripReminderEvent(trip.getId(), trip.getDriverId(), (int) diffMins));
            }
        }
    }

    /**
     * Tarea automática: Se ejecuta cada 1 minuto.
     * Busca viajes en estado ONGOING. Alerta si falta 5 mins para llegar, o si se pasó en múltiplos de 10 mins.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional(readOnly = true)
    public void checkLateArrivals() {
        LocalDateTime now = LocalDateTime.now();
        List<Trip> ongoingTrips = tripRepository.findByState(TripState.ONGOING, PageRequest.of(0, 500)).getContent();
        
        for (Trip trip : ongoingTrips) {
            if (trip.getEstimatedArrivalTime() != null) {
                long diffToArrival = java.time.Duration.between(now, trip.getEstimatedArrivalTime()).toMinutes();
                long diffPastArrival = java.time.Duration.between(trip.getEstimatedArrivalTime(), now).toMinutes();

                if (diffToArrival == 5) {
                    eventPublisher.publishEvent(new com.ucebuslink.shared.event.TripReminderEvent(trip.getId(), trip.getDriverId(), 5));
                } else if (diffPastArrival > 0 && diffPastArrival % 10 == 0) {
                    eventPublisher.publishEvent(new com.ucebuslink.shared.event.TripDelayedEvent(
                            trip.getId(), trip.getDriverId(), "El viaje está tomando más tiempo del estimado. Retraso: " + diffPastArrival + " min.", (int) diffPastArrival));
                }
            }
        }
    }
}