package com.ucebuslink.reservations.infrastructure.persistence.repository;

import com.ucebuslink.reservations.domain.model.Seat;
import com.ucebuslink.reservations.domain.repository.SeatRepository;
import com.ucebuslink.reservations.infrastructure.persistence.entity.SeatJpaEntity;
import com.ucebuslink.shared.constant.SeatState;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class SeatRepositoryAdapter implements SeatRepository {

    private final SpringDataSeatRepository jpaRepository;

    @Override
    public List<Seat> saveAll(List<Seat> seats) {
        log.debug("[RESERVATIONS] Saving batch of {} seats.", seats.size());
        List<SeatJpaEntity> entities = seats.stream().map(this::toJpa).collect(Collectors.toList());
        return jpaRepository.saveAll(entities).stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Seat save(Seat seat) {
        return toDomain(jpaRepository.save(toJpa(seat)));
    }

    @Override
    public Optional<Seat> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Seat> findByTripId(UUID tripId) {
        log.debug("[RESERVATIONS] Querying seats for Trip ID: {}", tripId);
        return jpaRepository.findByTripIdOrderBySeatNumberAsc(tripId)
                .stream().map(this::toDomain).collect(Collectors.toList());
    }

    @Override
    public Optional<Seat> findByTripIdAndSeatNumber(UUID tripId, Integer seatNumber) {
        return jpaRepository.findByTripIdAndSeatNumber(tripId, seatNumber).map(this::toDomain);
    }

    // Mappers manuales internos
    private Seat toDomain(SeatJpaEntity entity) {
        if (entity == null) return null;
        return new Seat(entity.getId(), entity.getTripId(), entity.getSeatNumber(), entity.getState(), entity.getVersion());
    }

    private SeatJpaEntity toJpa(Seat domain) {
        if (domain == null) return null;
        SeatJpaEntity entity = new SeatJpaEntity();
        entity.setId(domain.getId());
        entity.setTripId(domain.getTripId());
        entity.setSeatNumber(domain.getSeatNumber());
        entity.setState(domain.getState());
        entity.setVersion(domain.getVersion());
        return entity;
    }

    @Override
    public Page<Seat> findByTripId(UUID tripId, Pageable pageable) {
        log.debug("[RESERVATIONS] Querying seats for Trip ID: {}", tripId);
        return jpaRepository
            .findByTripIdOrderBySeatNumberAsc(tripId, pageable)
            .map(this::toDomain);
    }

    @Override
    public Page<Seat> findByTripIdAndState(
            UUID tripId,
            SeatState state,
            Pageable pageable
    ) {

        return jpaRepository
                .findByTripIdAndStateOrderBySeatNumberAsc(
                        tripId,
                        state,
                        pageable
                )
                .map(this::toDomain);
    }
}