package com.ucebuslink.reservations.adapters.input.http.exception;

import com.ucebuslink.reservations.domain.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice(basePackages = "com.ucebuslink.reservations.adapters.input.http")
public class ReservationExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ReservationExceptionHandler.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        if (ex.getRequiredType() != null && ex.getRequiredType().isAssignableFrom(UUID.class)) {
            return buildResponse("invalid_input", "Trip ID must be a valid UUID", HttpStatus.BAD_REQUEST);
        }
        return buildResponse("invalid_input", "Invalid parameter: " + ex.getName(), HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("UUID")) {
            return buildResponse("invalid_input", "Trip ID must be a valid UUID", HttpStatus.BAD_REQUEST);
        }
        return buildResponse("invalid_input", "Malformed JSON request", HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("[RESERVATIONS] Invalid argument: {}", ex.getMessage());
        return buildResponse("invalid_input", ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(TripNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTripNotFound(TripNotFoundException ex) {
        log.warn("[RESERVATIONS] Trip not found: {}", ex.getMessage());
        return buildResponse("trip_not_found", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoAvailableSeatsException.class)
    public ResponseEntity<Map<String, Object>> handleNoAvailableSeats(NoAvailableSeatsException ex) {
        log.warn("[RESERVATIONS] No available seats: {}", ex.getMessage());
        return buildResponse("no_available_seats", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DuplicateReservationException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateReservation(DuplicateReservationException ex) {
        log.warn("[RESERVATIONS] Duplicate reservation: {}", ex.getMessage());
        return buildResponse("duplicate_reservation", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(TripAlreadyStartedException.class)
    public ResponseEntity<Map<String, Object>> handleTripAlreadyStarted(TripAlreadyStartedException ex) {
        log.warn("[RESERVATIONS] Trip already started: {}", ex.getMessage());
        return buildResponse("trip_already_started", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InsufficientTrustScoreException.class)
    public ResponseEntity<Map<String, Object>> handleInsufficientTrustScore(InsufficientTrustScoreException ex) {
        log.warn("[RESERVATIONS] Insufficient trust score. Current: {}, Required: {}", ex.getCurrentScore(), ex.getMinimumRequired());
        
        Map<String, Object> body = new HashMap<>();
        body.put("error", "insufficient_trust_score");
        body.put("error_description", ex.getMessage());
        body.put("timestamp", ZonedDateTime.now(ZoneOffset.UTC).format(ISO_FORMATTER));
        
        Map<String, Integer> data = new HashMap<>();
        data.put("currentScore", ex.getCurrentScore());
        data.put("minimumRequired", ex.getMinimumRequired());
        body.put("data", data);
        
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(SeatNoLongerAvailableException.class)
    public ResponseEntity<Map<String, Object>> handleSeatNoLongerAvailable(SeatNoLongerAvailableException ex) {
        log.warn("[RESERVATIONS] Seat no longer available: {}", ex.getMessage());
        return buildResponse("seat_no_longer_available", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        log.error("[RESERVATIONS] Internal server error [traceId: {}]", traceId, ex);
        
        Map<String, Object> body = new HashMap<>();
        body.put("error", "database_error");
        body.put("error_description", "Failed to save reservation. Please try again.");
        body.put("timestamp", ZonedDateTime.now(ZoneOffset.UTC).format(ISO_FORMATTER));
        body.put("traceId", traceId);
        
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(String error, String description, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", error);
        body.put("error_description", description);
        body.put("timestamp", ZonedDateTime.now(ZoneOffset.UTC).format(ISO_FORMATTER));
        return new ResponseEntity<>(body, status);
    }
}
