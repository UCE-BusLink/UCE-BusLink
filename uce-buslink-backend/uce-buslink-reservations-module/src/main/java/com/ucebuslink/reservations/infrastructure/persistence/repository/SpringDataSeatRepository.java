package com.ucebuslink.reservations.infrastructure.persistence.repository;

import com.ucebuslink.reservations.infrastructure.persistence.entity.SeatJpaEntity;
import com.ucebuslink.shared.constant.SeatState;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataSeatRepository extends JpaRepository<SeatJpaEntity, UUID> {
    List<SeatJpaEntity> findByTripIdOrderBySeatNumberAsc(UUID tripId);
    Optional<SeatJpaEntity> findByTripIdAndSeatNumber(UUID tripId, Integer seatNumber);

    Page<SeatJpaEntity> findByTripIdOrderBySeatNumberAsc(UUID tripId, Pageable pageable);

    Page<SeatJpaEntity> findByTripIdAndStateOrderBySeatNumberAsc(
            UUID tripId,
            SeatState state,
            Pageable pageable
    );
}