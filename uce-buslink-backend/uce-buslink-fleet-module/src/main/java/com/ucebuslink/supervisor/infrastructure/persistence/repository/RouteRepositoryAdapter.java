package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.model.Route;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteStopJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.ucebuslink.shared.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

@Repository
public class RouteRepositoryAdapter implements RouteRepository {

    private static final Logger log = LoggerFactory.getLogger(RouteRepositoryAdapter.class);

    private final SpringDataRouteRepository springDataRouteRepository;
    private final SupervisorMapper supervisorMapper;

    public RouteRepositoryAdapter(SpringDataRouteRepository springDataRouteRepository, SupervisorMapper supervisorMapper) {
        this.springDataRouteRepository = springDataRouteRepository;
        this.supervisorMapper = supervisorMapper;
    }

    @SuppressWarnings("null")
    @Override
    public Route save(Route route) {
        log.info("Saving route with id: {}", route.getId());
        RouteJpaEntity jpaEntity = supervisorMapper.toJpa(route);
        RouteJpaEntity saved = springDataRouteRepository.save(jpaEntity);
        log.debug("Route saved successfully");
        return supervisorMapper.toDomain(saved);
    }

    @Override
    public Optional<Route> findById(UUID id) {
        log.info("Finding route by id: {}", id);
        return springDataRouteRepository.findByIdAndDeletedAtIsNull(id)
                .map(supervisorMapper::toDomain);
    }

    @Override
    public PageResponse<Route> findAll(boolean isActive, int page, int size) {
        log.info("Fetching paginated routes. Active: {}, Page: {}, Size: {}", isActive, page, size);
        Page<RouteJpaEntity> entityPage = springDataRouteRepository.findByDeletedAtIsNullAndIsActive(isActive, PageRequest.of(page, size));
        
        List<Route> routes = entityPage.getContent().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
                routes,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }

    @Override
    public List<Route> findAllActive() {
        log.info("Fetching all active routes (Optimized query)");
        long startTime = System.currentTimeMillis();
        
        List<RouteJpaEntity> entities = springDataRouteRepository.findAllActiveRoutes();
        
        log.debug("Found {} active routes in {} ms", entities.size(), (System.currentTimeMillis() - startTime));
        return entities.stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        log.info("Soft deleting route with id: {}", id);
        springDataRouteRepository.findByIdAndDeletedAtIsNull(id).ifPresent(entity -> {
            entity.setDeletedAt(LocalDateTime.now());
            springDataRouteRepository.save(entity);
            log.debug("Route {} soft deleted successfully", id);
        });
    }

    @Override
    public List<Route> findRoutesByStopId(UUID stopId) {
        log.info("Finding routes that include stop id: {}", stopId);
        return springDataRouteRepository.findByStopId(stopId).stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeStopFromRoutes(UUID stopId) {
        log.info("Removing stop {} from all associated routes", stopId);
        List<RouteJpaEntity> routes = springDataRouteRepository.findByStopId(stopId);

        for (RouteJpaEntity route : routes) {
            boolean removed = route.getRouteStops()
                    .removeIf(rs -> rs.getStop().getId().equals(stopId));
            
            if (removed) {
                log.debug("Reordering stops for route: {}", route.getId());
                int order = 1;
                for (RouteStopJpaEntity rs : route.getRouteStops()) {
                    rs.setStopOrder(order++);
                }
            }
        }
        log.info("Stop removal and route reordering completed");
    }
}