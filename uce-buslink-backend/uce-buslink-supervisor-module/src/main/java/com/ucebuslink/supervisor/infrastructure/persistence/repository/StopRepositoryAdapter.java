package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.model.Stop;
import com.ucebuslink.supervisor.domain.repository.StopRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.StopJpaEntity;
import com.ucebuslink.supervisor.infrastructure.persistence.mapper.SupervisorMapper;
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
}