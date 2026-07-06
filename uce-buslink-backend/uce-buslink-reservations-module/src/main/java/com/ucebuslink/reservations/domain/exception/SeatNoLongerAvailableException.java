package com.ucebuslink.reservations.domain.exception;

public class SeatNoLongerAvailableException extends RuntimeException {
    public SeatNoLongerAvailableException(String message) {
        super(message);
    }
}
