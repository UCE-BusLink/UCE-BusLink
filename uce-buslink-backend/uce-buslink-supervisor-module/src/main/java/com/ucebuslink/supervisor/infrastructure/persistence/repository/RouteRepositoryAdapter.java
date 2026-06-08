package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.model.Route;
import com.ucebuslink.supervisor.domain.repository.RouteRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.RouteJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;

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

    private final SpringDataRouteRepository springDataRouteRepository;
    private final SupervisorMapper supervisorMapper;

    public RouteRepositoryAdapter(SpringDataRouteRepository springDataRouteRepository, SupervisorMapper supervisorMapper) {
        this.springDataRouteRepository = springDataRouteRepository;
        this.supervisorMapper = supervisorMapper;
    }

    @SuppressWarnings("null")
    @Override
    public Route save(Route route) {
        RouteJpaEntity jpaEntity = supervisorMapper.toJpa(route);
        RouteJpaEntity saved = springDataRouteRepository.save(jpaEntity);
        return supervisorMapper.toDomain(saved);
    }

    @Override
    public Optional<Route> findById(UUID id) {
        return springDataRouteRepository.findByIdAndDeletedAtIsNull(id)
                .map(supervisorMapper::toDomain);
    }

    @Override
    public PageResponse<Route> findAll(boolean isActive, int page, int size) {
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
        return springDataRouteRepository.findAllActiveRoutes().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        springDataRouteRepository.findByIdAndDeletedAtIsNull(id).ifPresent(entity -> {
            entity.setDeletedAt(LocalDateTime.now());
            springDataRouteRepository.save(entity);
        });
    }
}