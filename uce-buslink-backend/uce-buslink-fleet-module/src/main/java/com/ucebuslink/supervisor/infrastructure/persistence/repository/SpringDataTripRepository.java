package com.ucebuslink.supervisor.infrastructure.persistence.repository;

import com.ucebuslink.shared.constant.TripState;
import com.ucebuslink.supervisor.infrastructure.persistence.entity.TripJpaEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface SpringDataTripRepository extends JpaRepository<TripJpaEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TripJpaEntity t WHERE t.id = :id")
    Optional<TripJpaEntity> findByIdWithPessimisticLock(UUID id);

    Page<TripJpaEntity> findByState(TripState state, Pageable pageable);

    Page<TripJpaEntity> findByRouteId(UUID routeId, Pageable pageable);

    Page<TripJpaEntity> findByDriverId(UUID driverId, Pageable pageable);

    Page<TripJpaEntity> findByDriverIdAndDepartureTimeBetweenOrderByDepartureTimeAsc(
            UUID driverId, 
            LocalDateTime startOfDay, 
            LocalDateTime endOfDay,
            Pageable pageable
    );
}