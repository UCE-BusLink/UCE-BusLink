package com.ucebuslink.tracking.infrastructure.persistence.repository;

import com.ucebuslink.tracking.domain.model.GpsLocationHistory;
import com.ucebuslink.tracking.domain.repository.GpsLocationHistoryRepository;
import com.ucebuslink.tracking.infrastructure.persistence.entity.GpsLocationHistoryJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class GpsLocationHistoryRepositoryAdapter implements GpsLocationHistoryRepository {

    private final SpringDataGpsLocationHistoryRepository springDataRepository;

    @Override
    public void saveAll(List<GpsLocationHistory> locations) {
        List<GpsLocationHistoryJpaEntity> entities = locations.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
        
        springDataRepository.saveAll(entities);
    }

    private GpsLocationHistoryJpaEntity toEntity(GpsLocationHistory domain) {
        GpsLocationHistoryJpaEntity entity = new GpsLocationHistoryJpaEntity();
        entity.setId(domain.getId());
        entity.setTripId(domain.getTripId());
        entity.setLatitude(domain.getLatitude());
        entity.setLongitude(domain.getLongitude());
        entity.setAccuracy(domain.getAccuracy());
        entity.setVelocity(domain.getVelocity());
        entity.setRecordedAt(domain.getRecordedAt());
        return entity;
    }
}