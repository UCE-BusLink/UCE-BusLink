package com.ucebuslink.supervisor.infrastructure.persistence.mapper;

import com.ucebuslink.supervisor.domain.model.*;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.*;
import com.ucebuslink.supervisor.infrastructure.persistence.repository.SpringDataStopRepository;

import lombok.RequiredArgsConstructor;

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

    /*
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

                // NO asignar manualmente la clave compuesta.
                // Hibernate la construirá mediante @MapsId.
                //
                // rsEntity.setId(
                //     new RouteStopKey(
                //         domain.getId(),
                //         rs.getStop().getId()
                //     )
                // );

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
    } */

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

}