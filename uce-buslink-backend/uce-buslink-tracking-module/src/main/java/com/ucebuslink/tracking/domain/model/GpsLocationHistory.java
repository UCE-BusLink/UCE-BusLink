package com.ucebuslink.tracking.domain.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class GpsLocationHistory {
    private UUID id;
    private UUID tripId;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private Double velocity;
    private LocalDateTime recordedAt;

    // Constructor para nuevos registros
    public GpsLocationHistory(UUID tripId, Double latitude, Double longitude, Double accuracy, Double velocity) {
        this.id = UUID.randomUUID();
        this.tripId = tripId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.accuracy = accuracy;
        this.velocity = velocity;
        this.recordedAt = LocalDateTime.now();
    }
}