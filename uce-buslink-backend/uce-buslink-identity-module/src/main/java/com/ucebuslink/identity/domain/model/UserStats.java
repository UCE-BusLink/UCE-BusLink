package com.ucebuslink.identity.domain.model;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserStats {
    private UUID id;
    private UUID userId;
    
    private int totalTrips;
    private int completedTrips;
    private double totalDistanceKm;
    private double totalHoursTransit;
    private int activeDays;
    
    public static UserStats createDefault(UUID userId) {
        return UserStats.builder()
                .userId(userId)
                .totalTrips(0)
                .completedTrips(0)
                .totalDistanceKm(0.0)
                .totalHoursTransit(0.0)
                .activeDays(0)
                .build();
    }

    public void addCompletedTrip(double distanceKm, double durationHours) {
        this.completedTrips++;
        this.totalDistanceKm += distanceKm;
        this.totalHoursTransit += durationHours;
    }

    public void addTotalTrip() {
        this.totalTrips++;
    }
}
