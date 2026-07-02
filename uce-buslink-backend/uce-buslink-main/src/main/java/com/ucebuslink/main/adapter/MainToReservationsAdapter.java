package com.ucebuslink.main.adapter;

import com.ucebuslink.reservations.domain.model.Reservation;
import com.ucebuslink.reservations.domain.repository.ReservationRepository;
import com.ucebuslink.supervisor.application.port.out.FleetToReservationPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MainToReservationsAdapter implements FleetToReservationPort {

    private final ReservationRepository reservationRepository;

    @Override
    public List<UUID> getStudentIdsByTrip(UUID tripId) {
        // Obtenemos directamente de la BD saltándonos el servicio que causa el bucle
        return reservationRepository.findByTripId(tripId)
                .stream()
                .filter(res -> !res.getStatus().name().startsWith("CANCELLED"))
                .map(Reservation::getUserId)
                .collect(Collectors.toList());
    }
}