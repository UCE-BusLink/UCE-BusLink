package com.ucebuslink.shared.exception;

import com.ucebuslink.shared.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // DTO validation (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("[VALIDATION_ERROR] Bad request payload rejected. Details: {}", errors);

        ErrorResponse response = new ErrorResponse(
                "validation_error",
                "Invalid input data",
                errors,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Unsynced or otherwise unauthenticated principal (e.g. missing local user link)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        log.warn("[AUTH_ERROR] Unauthenticated request rejected: {}", ex.getMessage());

        ErrorResponse response = new ErrorResponse(
                "unauthenticated",
                ex.getMessage(),
                null,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // User not found (account doesn't exist in system)
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        log.warn("[AUTH_ERROR] User not found: {}", ex.getMessage());

        ErrorResponse response = new ErrorResponse(
                "user_not_found",
                ex.getMessage(),
                null,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // "Not found"
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeExceptions(RuntimeException ex) {
        // 404 for "not found" messages, 400 otherwise
        HttpStatus status = ex.getMessage().toLowerCase().contains("not found") ? 
                            HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
                            
        log.warn("[BUSINESS_ERROR] Handled runtime exception (HTTP {}): {}", status.value(), ex.getMessage());

        ErrorResponse response = new ErrorResponse(
                "business_error",
                ex.getMessage(),
                null,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, status);
    }

    // Critical errors (DB failure, NullPointer, etc.)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        log.error("[CRITICAL_FAILURE] Unhandled server exception caught globally: ", ex);
        
        ErrorResponse response = new ErrorResponse(
                "internal_server_error",
                "An unexpected internal error occurred. Please contact support.",
                null,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}