package com.ucebuslink.reservations.infrastructure.persistence.repository;

import com.ucebuslink.reservations.domain.model.Reservation;
import com.ucebuslink.reservations.domain.repository.ReservationRepository;
import com.ucebuslink.reservations.infrastructure.persistence.entity.ReservationJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

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
}