package com.ucebuslink.supervisor.infrastructure.persistence.mapper;

import com.ucebuslink.supervisor.domain.model.*;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.*;
import com.ucebuslink.supervisor.infrastructure.persistence.repository.SpringDataStopRepository;

import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SupervisorMapper {

    private final SpringDataStopRepository stopRepository;

    // --- BUS MAPPERS ---
    public Bus toDomain(BusJpaEntity entity) {
        if (entity == null) return null;
        return new Bus(
            entity.getId(), entity.getPlateNumber(), entity.getInternalCode(),
            entity.getSeatCapacity(), entity.getManufacturer(), entity.getModel(),
            entity.getOperationalStatus(), entity.getCreatedBy(), entity.getUpdatedBy(),
            entity.getCreatedAt(), entity.getUpdatedAt(), entity.getDeletedAt()
        );
    }

    public BusJpaEntity toJpa(Bus domain) {
        if (domain == null) return null;
        BusJpaEntity entity = new BusJpaEntity();
        entity.setId(domain.getId());
        entity.setPlateNumber(domain.getPlateNumber());
        entity.setInternalCode(domain.getInternalCode());
        entity.setSeatCapacity(domain.getSeatCapacity());
        entity.setManufacturer(domain.getManufacturer());
        entity.setModel(domain.getModel());
        entity.setOperationalStatus(domain.getOperationalStatus());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setDeletedAt(domain.getDeletedAt());
        return entity;
    }

    // --- STOP MAPPERS ---
    public Stop toDomain(StopJpaEntity entity) {
        if (entity == null) return null;
        return new Stop(
            entity.getId(), entity.getName(), entity.getLatitude(),
            entity.getLongitude(), entity.getIsActive(), entity.getCreatedAt(), entity.getDeletedAt()
        );
    }

    public StopJpaEntity toJpa(Stop domain) {
        if (domain == null) return null;
        StopJpaEntity entity = new StopJpaEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setLatitude(domain.getLatitude());
        entity.setLongitude(domain.getLongitude());
        entity.setIsActive(domain.getIsActive());
        entity.setDeletedAt(domain.getDeletedAt());
        return entity;
    }

    // --- ROUTE MAPPERS ---
    public Route toDomain(RouteJpaEntity entity) {
        if (entity == null) return null;
        Route route = new Route();
        route.setId(entity.getId());
        route.setName(entity.getName());
        route.setDescription(entity.getDescription());
        route.setIsActive(entity.getIsActive());
        route.setEstimatedDurationMinutes(entity.getEstimatedDurationMinutes());
        route.setPathPolyline(entity.getPathPolyline());
        route.setCreatedBy(entity.getCreatedBy());
        route.setUpdatedBy(entity.getUpdatedBy());
        route.setCreatedAt(entity.getCreatedAt());
        route.setUpdatedAt(entity.getUpdatedAt());
        route.setDeletedAt(entity.getDeletedAt());

        if (entity.getRouteStops() != null) {
            route.setRouteStops(entity.getRouteStops().stream()
                .map(rs -> new RouteStop(
                    toDomain(rs.getStop()),
                    rs.getStopOrder(),
                    rs.getEstimatedMinutesFromStart(),
                    rs.getCreatedAt()
                )).collect(Collectors.toList()));
        }
        return route;
    }

    @SuppressWarnings("null")
    public RouteJpaEntity toJpa(Route domain) {
        if (domain == null) {
            return null;
        }

        RouteJpaEntity entity = new RouteJpaEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setDescription(domain.getDescription());
        entity.setIsActive(domain.getIsActive());
        entity.setEstimatedDurationMinutes(domain.getEstimatedDurationMinutes());
        entity.setPathPolyline(domain.getPathPolyline());
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setDeletedAt(domain.getDeletedAt());

        if (domain.getRouteStops() != null) {
            domain.getRouteStops().forEach(rs -> {

                RouteStopJpaEntity rsEntity = new RouteStopJpaEntity();

                StopJpaEntity stopEntity =
                    stopRepository.getReferenceById(
                        rs.getStop().getId()
                    );

                rsEntity.setStop(stopEntity);
                rsEntity.setStopOrder(rs.getStopOrder());
                rsEntity.setEstimatedMinutesFromStart(
                    rs.getEstimatedMinutesFromStart()
                );

                entity.addStop(rsEntity);
            });
        }

        return entity;
    }

    // --- SCHEDULE MAPPERS ---
    public ScheduleJpaEntity toEntity(Schedule domain, RouteJpaEntity routeJpaEntity) {
        if (domain == null) return null;

        ScheduleJpaEntity entity = new ScheduleJpaEntity();
        entity.setRoute(routeJpaEntity);
        entity.setIsActive(domain.isActive());
        
        // Mapear la lista de detalles
        if (domain.getDetails() != null) {
            for (ScheduleDetail detailDomain : domain.getDetails()) {
                ScheduleDetailJpaEntity detailEntity = new ScheduleDetailJpaEntity();
                detailEntity.setType(detailDomain.getType());
                detailEntity.setDaysOfWeek(new HashSet<>(detailDomain.getDaysOfWeek()));
                detailEntity.setFixedDepartureTimes(new ArrayList<>(detailDomain.getFixedDepartureTimes()));
                detailEntity.setFrequencyStartTime(detailDomain.getFrequencyStartTime());
                detailEntity.setFrequencyEndTime(detailDomain.getFrequencyEndTime());
                detailEntity.setFrequencyIntervalMinutes(detailDomain.getFrequencyIntervalMinutes());
                
                // Usamos el helper para que se asigne el schedule_id automáticamente
                entity.addDetail(detailEntity); 
            }
        }
        
        return entity;
    }

    public Schedule toDomain(ScheduleJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        List<ScheduleDetail> details = entity.getDetails()
                .stream()
                .map(detail -> new ScheduleDetail(
                        detail.getType(),
                        detail.getDaysOfWeek(),
                        detail.getFixedDepartureTimes(),
                        detail.getFrequencyStartTime(),
                        detail.getFrequencyEndTime(),
                        detail.getFrequencyIntervalMinutes()
                ))
                .collect(Collectors.toList());

        return new Schedule(
                entity.getId(),
                entity.getRoute() != null ? entity.getRoute().getId() : null,
                details,
                entity.getIsActive()
        );
    }

    // --- TRIP MAPPERS ---
    public Trip toDomain(TripJpaEntity entity) {
        if (entity == null) return null;
        return new Trip(
            entity.getId(), entity.getRouteId(), entity.getBusId(),
            entity.getDriverId(), entity.getState(), entity.getDepartureTime(),
            entity.getEstimatedArrivalTime(), entity.getActualArrivalTime(),
            entity.getStartedAt(), entity.getCompletedAt(), entity.getCancelledAt(),
            entity.getAvailableSeats(), entity.getVersion(), entity.getCreatedBy(),
            entity.getUpdatedBy(), entity.getCreatedAt(), entity.getUpdatedAt(),
            entity.getDeletedAt()
        );
    }

    public TripJpaEntity toJpa(Trip domain) {
        if (domain == null) return null;
        TripJpaEntity entity = new TripJpaEntity();
        entity.setId(domain.getId());
        entity.setRouteId(domain.getRouteId());
        entity.setBusId(domain.getBusId());
        entity.setDriverId(domain.getDriverId());
        entity.setState(domain.getState());
        entity.setDepartureTime(domain.getDepartureTime());
        entity.setEstimatedArrivalTime(domain.getEstimatedArrivalTime());
        entity.setActualArrivalTime(domain.getActualArrivalTime());
        entity.setStartedAt(domain.getStartedAt());
        entity.setCompletedAt(domain.getCompletedAt());
        entity.setCancelledAt(domain.getCancelledAt());
        entity.setAvailableSeats(domain.getAvailableSeats());
        // El versionado lo maneja Spring JPA automáticamente mediante la anotación @Version, pero podemos pasarlo.
        if (domain.getVersion() != null) {
            entity.setVersion(domain.getVersion());
        }
        entity.setCreatedBy(domain.getCreatedBy());
        entity.setUpdatedBy(domain.getUpdatedBy());
        entity.setDeletedAt(domain.getDeletedAt());
        return entity;
    }
}