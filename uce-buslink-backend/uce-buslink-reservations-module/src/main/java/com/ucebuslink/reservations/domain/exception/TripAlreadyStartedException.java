package com.ucebuslink.reservations.domain.exception;

public class TripAlreadyStartedException extends RuntimeException {
    public TripAlreadyStartedException(String message) {
        super(message);
    }
}
