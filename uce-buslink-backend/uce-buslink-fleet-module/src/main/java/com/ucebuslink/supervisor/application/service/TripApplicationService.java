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
import com.ucebuslink.shared.event.AdminEntityChangedEvent;
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
        log.info("[FLEET-TRIP] Starting validation to create trips in batch. Bus: {}, Route: {}",
                command.busId(), command.routeId());

        Bus bus = busRepository.findById(command.busId())
                .orElseThrow(() -> new IllegalArgumentException("The specified bus does not exist."));

        com.ucebuslink.supervisor.domain.model.Route route = routeRepository.findById(command.routeId())
                .orElseThrow(() -> new IllegalArgumentException("The specified route does not exist."));

        List<TripResponse> responses = new ArrayList<>();

        // Iterate over each date and time sent from the frontend calendar
        for (java.time.LocalDateTime departure : command.departures()) {

            // Se desactiva la validación estricta para permitir viajes manuales/offline
            // validateDepartureAgainstSchedule(command.routeId(), departure);

            // TODO: Add validation to check that the Bus/Driver doesn't have another overlapping trip at this same time.

            Trip trip = new Trip();
            trip.setRouteId(command.routeId());
            trip.setBusId(command.busId());
            trip.setDriverId(command.driverId());
            trip.setState(TripState.SCHEDULED);

            // Set departure and calculate arrival
            trip.setDepartureTime(departure);
            trip.setEstimatedArrivalTime(departure.plusMinutes(route.getEstimatedDurationMinutes()));
            trip.setAvailableSeats(bus.getSeatCapacity());

            Trip savedTrip = tripRepository.save(trip);

            eventPublisher.publishEvent(new TripCreatedEvent(savedTrip.getId(), bus.getSeatCapacity()));
            eventPublisher.publishEvent(new AdminEntityChangedEvent("TRIP", "CREATED", savedTrip.getId()));
            
            responses.add(new TripResponse(
                    savedTrip.getId(), savedTrip.getRouteId(), savedTrip.getBusId(),
                    savedTrip.getDriverId(), savedTrip.getState(), savedTrip.getDepartureTime(),
                    savedTrip.getEstimatedArrivalTime(), savedTrip.getAvailableSeats()
            ));
        }

        log.info("[FLEET-TRIP] {} trips were successfully scheduled.", responses.size());
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public TripResponse getTripById(UUID id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));
        return mapToResponse(trip);
    }

    @Transactional
    public TripResponse getTripWithLock(UUID id) {
        log.debug("[FLEET-TRIP] Retrieving trip with PESSIMISTIC_WRITE lock: {}", id);
        Trip trip = tripRepository.findByIdWithLock(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));
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
        log.info("[FLEET-TRIP] Starting update for trip ID: {}", id);

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));

        // Business validation: can only be edited if it hasn't started yet
        if (trip.getState() != TripState.SCHEDULED) {
            log.warn("[FLEET-TRIP] Attempt to edit trip in state {} denied (ID: {})", trip.getState(), id);
            throw new IllegalStateException("Only trips in SCHEDULED state can be edited.");
        }

        // Se desactiva la validación estricta para permitir edición de viajes manuales/offline
        // validateDepartureAgainstSchedule(command.routeId(), command.departureTime());

        Bus bus = busRepository.findById(command.busId())
                .orElseThrow(() -> new IllegalArgumentException("The specified bus does not exist."));

        com.ucebuslink.supervisor.domain.model.Route route = routeRepository.findById(command.routeId())
                .orElseThrow(() -> new IllegalArgumentException("The specified route does not exist."));

        // Apply the changes
        trip.setRouteId(command.routeId());
        trip.setBusId(command.busId());
        trip.setDriverId(command.driverId());
        trip.setDepartureTime(command.departureTime());

        // Recalculate times and seats in case the route or bus changed
        trip.setEstimatedArrivalTime(command.departureTime().plusMinutes(route.getEstimatedDurationMinutes()));
        trip.setAvailableSeats(bus.getSeatCapacity());

        Trip updatedTrip = tripRepository.save(trip);
        log.info("[FLEET-TRIP] Trip updated successfully. New bus assigned: {}", updatedTrip.getBusId());
        eventPublisher.publishEvent(new AdminEntityChangedEvent("TRIP", "UPDATED", updatedTrip.getId()));
        
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
                    "There are no schedules configured for this route.");
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
                    "The date/time " + departureTime +
                    " does not match the days and times allowed in the route's schedules.");
        }
    }

    @Override
    @Transactional
    public void cancelTrip(UUID id) {
        log.info("[FLEET-TRIP] Attempting to logically cancel trip ID: {}", id);

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));

        if (trip.getState() == TripState.COMPLETED || trip.getState() == TripState.CANCELLED) {
            throw new IllegalStateException("The trip is already completed or previously cancelled.");
        }

        trip.setState(TripState.CANCELLED);
        trip.setCancelledAt(LocalDateTime.now());
        trip.setDeletedAt(LocalDateTime.now()); // Logical delete to hide it from common listings

        List<UUID> students = reservationPort.getStudentIdsByTrip(trip.getId());

        eventPublisher.publishEvent(
            new TripCancelledEvent(
                trip.getId(),
                trip.getDriverId(),
                students,
                "Trip cancelled"
            )
        );

        tripRepository.save(trip);
        log.info("[FLEET-TRIP] Trip ID: {} successfully cancelled.", id);
        eventPublisher.publishEvent(new AdminEntityChangedEvent("TRIP", "DELETED", id));
    }

    @Override
    @Transactional
    public TripResponse changeTripState(UUID id, ChangeTripStateCommand command) {
        log.info("[FLEET-TRIP] Changing state of trip ID: {} to {}", id, command.newState());

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));

        TripState currentState = trip.getState();
        TripState newState = command.newState();

        if (currentState == newState) {
            return mapToResponse(trip);
        }

        if (currentState == TripState.CANCELLED || currentState == TripState.COMPLETED) {
            throw new IllegalStateException("The state of a finished or cancelled trip cannot be changed.");
        }

        // Validation of allowed transitions
        if (newState == TripState.ONGOING && currentState == TripState.SCHEDULED) {
            if (LocalDateTime.now().isBefore(trip.getDepartureTime().minusMinutes(10))) {
                throw new IllegalStateException("The trip cannot be started earlier than 10 minutes before the scheduled departure.");
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
            throw new IllegalStateException("Invalid state transition: from " + currentState + " to " + newState);
        }

        Trip updatedTrip = tripRepository.save(trip);
        eventPublisher.publishEvent(new AdminEntityChangedEvent("TRIP", "UPDATED", updatedTrip.getId()));
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
        log.debug("[FLEET-TRIP] Querying active trip for bus {}", busId);

        // Search among ONGOING trips for the one belonging to this bus
        // We use the first page assuming a bus does not have 2 active trips at the same time
        Page<TripResponse> ongoingTrips = getTripsByState(TripState.ONGOING, 0, 50);
        
        return ongoingTrips.stream()
                .filter(trip -> trip.busId().equals(busId))
                .map(TripResponse::id)
                .findFirst()
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public String getBusPlateNumber(UUID busId) {
        log.debug("[FLEET-TRIP] Querying plate number for bus {}", busId);
        return busRepository.findById(busId)
                // Note: Adjust ".getPlate()" if your Bus entity uses a different name (e.g. getPlateNumber)
                .map(Bus::getPlateNumber)
                .orElse("Unknown");
    }

    @Transactional(readOnly = true)
    public int getBusTotalCapacity(UUID busId) {
        log.debug("[FLEET-TRIP] Querying total capacity for bus {}", busId);
        return busRepository.findById(busId)
                .map(Bus::getSeatCapacity) // This getter was seen in the trip creation code
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public String getRouteNameByTrip(UUID tripId) {
        log.debug("[FLEET-TRIP] Querying route name for trip {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> routeRepository.findById(trip.getRouteId()))
                // Note: Adjust ".getName()" if your Route entity uses a different name for the route name
                .map(com.ucebuslink.supervisor.domain.model.Route::getName)
                .orElse("Unknown Route");
    }

    @Transactional(readOnly = true)
    public int getTripOccupiedSeats(UUID tripId) {
        log.debug("[FLEET-TRIP] Querying occupied seats for trip {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> busRepository.findById(trip.getBusId())
                        // Occupied = Total capacity - Currently available seats
                        .map(bus -> bus.getSeatCapacity() - trip.getAvailableSeats()))
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public double[] getNextStopCoordinates(UUID tripId) {
        log.debug("[FLEET-TRIP] Querying next stop coordinates for trip {}", tripId);
        return tripRepository.findById(tripId)
                .flatMap(trip -> routeRepository.findById(trip.getRouteId()))
                .filter(route -> route.getRouteStops() != null && !route.getRouteStops().isEmpty())
                .map(route -> {
                    // Get the route's initial stop based on order
                    Stop nextStop = route.getRouteStops().stream()
                            .min((rs1, rs2) -> Integer.compare(rs1.getStopOrder(), rs2.getStopOrder()))
                            .orElseThrow()
                            .getStop();
                    return new double[]{nextStop.getLatitude(), nextStop.getLongitude()};
                })
                .orElse(null); // Returns null if there are no stops, the Haversine will handle it
    }

    @Transactional(readOnly = true)
    public String getNextStopName(UUID tripId) {
        log.debug("[FLEET-TRIP] Querying next stop name for trip {}", tripId);
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
                .orElse("Unknown Stop");
    }

    public Page<TripResponse> getTripsByDriverAndDate(UUID driverId, LocalDate date, int page, int size) {
        log.info("[APP-FLEET] Querying paginated trips for driver ID: {} on date: {}", driverId, date);

        Pageable pageable = PageRequest.of(page, size);

        return tripRepository.findTripsByDriverAndDate(driverId, date, pageable)
                .map(this::mapToResponse);// Transforms Domain to DTO while keeping the Page structure
    }

    /**
     * Automatic task: Runs every 1 minute.
     * Finds trips in SCHEDULED state that are more than 30 minutes delayed
     * (departureTime < (now - 30 mins)) and automatically cancels them.
     * It also alerts if the trip's delay is a multiple of 5 minutes (5, 10, 15...).
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkDelayedTrips() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cancelThreshold = now.minusMinutes(30);
        
        List<Trip> scheduledTrips = tripRepository.findByState(TripState.SCHEDULED, PageRequest.of(0, 500)).getContent();
        
        for (Trip trip : scheduledTrips) {
            if (trip.getDepartureTime().isBefore(cancelThreshold)) {
                log.warn("[FLEET-TRIP-JOB] Cancelling delayed trip (ID: {}) scheduled for {}", trip.getId(), trip.getDepartureTime());
                cancelTrip(trip.getId());
            } else {
                long diffMins = java.time.Duration.between(trip.getDepartureTime(), now).toMinutes();
                if (diffMins > 0 && diffMins % 5 == 0 && diffMins <= 30) {
                    log.info("[FLEET-TRIP-JOB] Delay alert for trip (ID: {}) not yet started", trip.getId());
                    eventPublisher.publishEvent(new com.ucebuslink.shared.event.TripDelayedEvent(
                            trip.getId(), trip.getDriverId(), "It has been " + diffMins + " minutes delayed in starting the trip.", (int) diffMins));
                }
            }
        }
    }

    /**
     * Automatic task: Runs every 1 minute.
     * Finds trips in SCHEDULED state that are exactly 15, 10, 5, or 0 minutes
     * away from starting and sends a reminder to the driver.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional(readOnly = true)
    public void remindUpcomingTrips() {
        LocalDateTime now = LocalDateTime.now();
        List<Trip> scheduledTrips = tripRepository.findByState(TripState.SCHEDULED, PageRequest.of(0, 500)).getContent();
        
        for (Trip trip : scheduledTrips) {
            long diffMins = java.time.Duration.between(now, trip.getDepartureTime()).toMinutes();
            
            if (diffMins == 15 || diffMins == 10 || diffMins == 5 || diffMins == 0) {
                log.info("[FLEET-TRIP-JOB] Trip reminder (ID: {}) in {} minutes", trip.getId(), diffMins);
                eventPublisher.publishEvent(new com.ucebuslink.shared.event.TripReminderEvent(trip.getId(), trip.getDriverId(), (int) diffMins));
            }
        }
    }

    /**
     * Automatic task: Runs every 1 minute.
     * Finds trips in ONGOING state. Alerts if 5 minutes remain to arrival, or if it has exceeded it by multiples of 10 minutes.
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
                            trip.getId(), trip.getDriverId(), "The trip is taking longer than estimated. Delay: " + diffPastArrival + " min.", (int) diffPastArrival));
                }
            }
        }
    }
}