package com.ucebuslink.shared.exception;

import com.ucebuslink.shared.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Maneja errores de validación de los DTOs (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse response = new ErrorResponse(
                "validation_error",
                "Invalid input data",
                errors,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Maneja errores de negocio genéricos (como "No encontrado")
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeExceptions(RuntimeException ex) {
        ErrorResponse response = new ErrorResponse(
                "business_error",
                ex.getMessage(),
                null,
                LocalDateTime.now()
        );
        // Si el mensaje dice "not found", devolvemos 404, sino 400
        HttpStatus status = ex.getMessage().toLowerCase().contains("not found") ? 
                            HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
                            
        return new ResponseEntity<>(response, status);
    }
}