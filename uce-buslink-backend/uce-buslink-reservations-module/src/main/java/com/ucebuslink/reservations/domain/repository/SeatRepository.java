package com.ucebuslink.reservations.domain.repository;

import com.ucebuslink.reservations.domain.model.Seat;
import com.ucebuslink.shared.constant.SeatState;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SeatRepository {
    List<Seat> saveAll(List<Seat> seats);
    Seat save(Seat seat);
    Optional<Seat> findById(UUID id);
    List<Seat> findByTripId(UUID tripId);
    Optional<Seat> findByTripIdAndSeatNumber(UUID tripId, Integer seatNumber);
    Page<Seat> findByTripId(UUID tripId, Pageable pageable);

    Page<Seat> findByTripIdAndState(
            UUID tripId,
            SeatState state,
            Pageable pageable
    );
}