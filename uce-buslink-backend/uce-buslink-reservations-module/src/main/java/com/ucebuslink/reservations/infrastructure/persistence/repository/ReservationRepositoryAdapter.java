package com.ucebuslink.reservations.infrastructure.persistence.repository;

import com.ucebuslink.reservations.domain.model.Reservation;
import com.ucebuslink.reservations.domain.repository.ReservationRepository;
import com.ucebuslink.reservations.infrastructure.persistence.entity.ReservationJpaEntity;
import com.ucebuslink.shared.constant.ReservationStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReservationRepositoryAdapter implements ReservationRepository {

    private final SpringDataReservationRepository jpaRepository;

    @Override
    public Reservation save(Reservation reservation) {
        ReservationJpaEntity entity = new ReservationJpaEntity();
        entity.setId(reservation.getId());
        entity.setUserId(reservation.getUserId());
        entity.setTripId(reservation.getTripId());
        entity.setSeatId(reservation.getSeatId());
        entity.setBoardingStopId(reservation.getBoardingStopId());
        entity.setStatus(reservation.getStatus());
        entity.setQrCode(reservation.getQrCode());
        entity.setExternalReference(reservation.getExternalReference());
        entity.setVersion(reservation.getVersion());
        // Fechas y auditoria...
        
        ReservationJpaEntity saved = jpaRepository.save(entity);
        reservation.setId(saved.getId());
        return reservation;
    }

    @Override
    public boolean existsByTripAndUser(UUID tripId, UUID userId) {
        return jpaRepository.existsByTripIdAndUserId(tripId, userId);
    }

    @Override
    public Page<Reservation> findByUserIdAndStatus(UUID userId, ReservationStatus status, Pageable pageable) {
        return jpaRepository.findByUserIdAndStatusOrderByReservedAtDesc(userId, status, pageable).map(this::toDomain);
    }

    @Override
    public Page<Reservation> findByUserId(UUID userId, Pageable pageable) {
        return jpaRepository.findByUserIdOrderByReservedAtDesc(userId, pageable).map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findByIdAndUserId(UUID id, UUID userId) {
        return jpaRepository.findByIdAndUserId(id, userId).map(this::toDomain);
    }

    @Override
    public Optional<Reservation> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    private Reservation toDomain(ReservationJpaEntity entity) {
        if (entity == null) return null;
        Reservation res = new Reservation();
        res.setId(entity.getId());
        res.setUserId(entity.getUserId());
        res.setTripId(entity.getTripId());
        res.setSeatId(entity.getSeatId());
        res.setBoardingStopId(entity.getBoardingStopId());
        res.setStatus(entity.getStatus());
        res.setQrCode(entity.getQrCode());
        res.setExternalReference(entity.getExternalReference());
        res.setReservedAt(entity.getReservedAt());
        res.setCancelledAt(entity.getCancelledAt());
        res.setBoardedAt(entity.getBoardedAt());
        res.setCancelReason(entity.getCancelReason());
        res.setVersion(entity.getVersion());
        return res;
    }

    // NUEVO
    @Override
    public java.util.List<Reservation> findByTripIdAndStatus(UUID tripId, ReservationStatus status) {
        return jpaRepository.findByTripIdAndStatus(tripId, status).stream()
                .map(this::toDomain).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<Reservation> findByTripId (UUID tripId) {
        return jpaRepository.findByTripId(tripId).stream().
                map(this::toDomain).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Page<Reservation> findActiveReservationsByTripId(UUID tripId, Pageable pageable) {
        return jpaRepository
                .findByTripIdAndStatusNot(tripId, ReservationStatus.CANCELLED_BY_ADMIN, pageable)
                .map(this::toDomain) // Descomenta y ajusta al nombre de tu mapper
                ; 
    }
}