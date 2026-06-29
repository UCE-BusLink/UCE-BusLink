package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.shared.dto.PageResponse;
import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.StopJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class StopRepositoryAdapter implements StopRepository {

    private final SpringDataStopRepository springDataStopRepository;
    private final SupervisorMapper supervisorMapper;

    public StopRepositoryAdapter(SpringDataStopRepository springDataStopRepository, SupervisorMapper supervisorMapper) {
        this.springDataStopRepository = springDataStopRepository;
        this.supervisorMapper = supervisorMapper;
    }

    @SuppressWarnings("null")
    @Override
    public Stop save(Stop stop) {
        StopJpaEntity jpaEntity = supervisorMapper.toJpa(stop);
        StopJpaEntity saved = springDataStopRepository.save(jpaEntity);
        return supervisorMapper.toDomain(saved);
    }

    @SuppressWarnings("null")
    @Override
    public Optional<Stop> findById(UUID id) {
        return springDataStopRepository.findById(id).map(supervisorMapper::toDomain);
    }

    @Override
    public List<Stop> findAllActive() {
        return springDataStopRepository.findAllActiveStops().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Stop> saveAll(List<Stop> stops) {

        List<StopJpaEntity> jpaEntities = stops.stream()
                .map(supervisorMapper::toJpa)
                .collect(Collectors.toList());
                
        List<StopJpaEntity> savedEntities = springDataStopRepository.saveAll(jpaEntities);
        
        return savedEntities.stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<Stop> findAllStops(boolean isActive, int page, int size){

        Page<StopJpaEntity> entityPage = springDataStopRepository.findByDeletedAtIsNullAndIsActive(isActive, PageRequest.of(page, size));

        List<Stop> stops = entityPage.getContent().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
                stops,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }

    @Override
    public StopJpaEntity getReferenceById(UUID id) {
        return springDataStopRepository.getReferenceById(id);
    }
}