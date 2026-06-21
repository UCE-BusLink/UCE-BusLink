package com.ucebuslink.reservations.infrastructure.persistence.repository;

import com.ucebuslink.reservations.infrastructure.persistence.entity.ReservationJpaEntity;
import com.ucebuslink.shared.constant.ReservationStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataReservationRepository extends JpaRepository<ReservationJpaEntity, UUID> {
    boolean existsByTripIdAndUserId(UUID tripId, UUID userId);

    Page<ReservationJpaEntity> findByUserIdOrderByReservedAtDesc(UUID userId, Pageable pageable);
    Optional<ReservationJpaEntity> findByIdAndUserId(UUID id, UUID userId);

    Page<ReservationJpaEntity> findByUserIdAndStatusOrderByReservedAtDesc(UUID userId, ReservationStatus status, Pageable pageable);
    
}