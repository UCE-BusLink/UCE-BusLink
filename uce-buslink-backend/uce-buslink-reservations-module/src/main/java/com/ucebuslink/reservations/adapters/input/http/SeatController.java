package com.ucebuslink.reservations.adapters.input.http;

import com.ucebuslink.reservations.application.dto.SeatResponse;
import com.ucebuslink.reservations.application.service.SeatApplicationService;
import com.ucebuslink.shared.constant.SeatState;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/reservations/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatApplicationService seatApplicationService;

    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('USER')")
    public ResponseEntity<Page<SeatResponse>> getSeatsByTrip(
            @PathVariable("tripId") UUID tripId,
            @RequestParam(name = "state", required = false) SeatState state,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {

        Pageable pageable = PageRequest.of(page, size);

        Page<SeatResponse> seats =
                seatApplicationService.getSeatsByTrip(tripId, state, pageable);

        return ResponseEntity.ok(seats);
    }
}