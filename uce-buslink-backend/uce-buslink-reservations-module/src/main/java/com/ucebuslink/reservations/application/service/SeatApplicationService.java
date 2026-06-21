package com.ucebuslink.reservations.application.service;

import com.ucebuslink.reservations.application.dto.SeatResponse;
import com.ucebuslink.reservations.domain.model.Seat;
import com.ucebuslink.shared.constant.*;
import com.ucebuslink.reservations.domain.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatApplicationService {

    private final SeatRepository seatRepository;

    @Transactional
    public void generateSeatsForTrip(UUID tripId, Integer capacity) {
        log.info("[RESERVATIONS] Generando {} asientos físicos para el Viaje ID: {}", capacity, tripId);
        
        List<Seat> seatsToCreate = new ArrayList<>();
        for (int i = 1; i <= capacity; i++) {
            seatsToCreate.add(new Seat(null, tripId, i, SeatState.AVAILABLE, 0L));
        }
        
        seatRepository.saveAll(seatsToCreate);
        log.info("[RESERVATIONS] Asientos generados exitosamente para el Viaje ID: {}", tripId);
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByTrip(UUID tripId) {
        log.debug("[RESERVATIONS] Consultando mapa de asientos para el Viaje ID: {}", tripId);
        return seatRepository.findByTripId(tripId).stream()
                .map(seat -> new SeatResponse(
                        seat.getId(),
                        seat.getTripId(),
                        seat.getSeatNumber(),
                        seat.getState()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<SeatResponse> getSeatsByTrip(UUID tripId, SeatState state, Pageable pageable) {

        log.debug("[RESERVATIONS] Consultando mapa de asientos para el Viaje ID: {}", tripId);

        Page<Seat> seats = state == null
                ? seatRepository.findByTripId(tripId, pageable)
                : seatRepository.findByTripIdAndState(tripId, state, pageable);

        return seats.map(seat -> new SeatResponse(
                seat.getId(),
                seat.getTripId(),
                seat.getSeatNumber(),
                seat.getState()
        ));
    }
}