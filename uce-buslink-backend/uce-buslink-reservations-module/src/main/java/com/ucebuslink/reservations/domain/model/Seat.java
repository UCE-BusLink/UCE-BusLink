package com.ucebuslink.reservations.domain.model;

import java.util.UUID;

import com.ucebuslink.shared.constant.SeatState;

public class Seat {
    private UUID id;
    private UUID tripId;
    private Integer seatNumber;
    private SeatState state;
    private Long version;

    public Seat() {}

    public Seat(UUID id, UUID tripId, Integer seatNumber, SeatState state, Long version) {
        this.id = id;
        this.tripId = tripId;
        this.seatNumber = seatNumber;
        this.state = state != null ? state : SeatState.AVAILABLE;
        this.version = version;
    }

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }

    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }

    public SeatState getState() { return state; }
    public void setState(SeatState state) { this.state = state; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}