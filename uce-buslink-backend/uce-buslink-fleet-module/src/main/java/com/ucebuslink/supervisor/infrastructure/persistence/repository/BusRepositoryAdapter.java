package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.supervisor.domain.model.Bus;
import com.ucebuslink.supervisor.domain.repository.BusRepository;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.BusJpaEntity;
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
public class BusRepositoryAdapter implements BusRepository {

    private final SpringDataBusRepository springDataBusRepository;
    private final SupervisorMapper supervisorMapper;

    public BusRepositoryAdapter(SpringDataBusRepository springDataBusRepository, SupervisorMapper supervisorMapper) {
        this.springDataBusRepository = springDataBusRepository;
        this.supervisorMapper = supervisorMapper;
    }

    @SuppressWarnings("null")
    @Override
    public Bus save(Bus bus) {
        BusJpaEntity jpaEntity = supervisorMapper.toJpa(bus);
        BusJpaEntity saved = springDataBusRepository.save(jpaEntity);
        return supervisorMapper.toDomain(saved);
    }

    @Override
    public Optional<Bus> findById(UUID id) {
        return springDataBusRepository.findByIdAndDeletedAtIsNull(id)
                .map(supervisorMapper::toDomain);
    }

    @Override
    public Optional<Bus> findByPlateNumber(String plateNumber) {
        return springDataBusRepository.findByPlateNumberAndDeletedAtIsNull(plateNumber)
                .map(supervisorMapper::toDomain);
    }

    @Override
    public List<Bus> findAllActive() {
        return springDataBusRepository.findAllActiveBuses().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public PageResponse<Bus> findAllActive(int page, int size) {
        Page<BusJpaEntity> entityPage = springDataBusRepository.findByDeletedAtIsNull(PageRequest.of(page, size));
        
        List<Bus> buses = entityPage.getContent().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
                buses,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }

    @Override
    public void deleteById(UUID id) {
        springDataBusRepository.findByIdAndDeletedAtIsNull(id).ifPresent(entity -> {
            entity.setDeletedAt(LocalDateTime.now());
            springDataBusRepository.save(entity);
        });
    }

    @Override
    public PageResponse<Bus> findAll(int page, int size){
        Page<BusJpaEntity> entityPage = springDataBusRepository.findAll(PageRequest.of(page, size));
        
        List<Bus> buses = entityPage.getContent().stream()
                .map(supervisorMapper::toDomain)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
                buses,
                entityPage.getNumber(),
                entityPage.getSize(),
                entityPage.getTotalElements(),
                entityPage.getTotalPages()
        );
    }
}