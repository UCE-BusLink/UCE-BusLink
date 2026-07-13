package com.ucebuslink.tracking.domain.service;

import org.springframework.stereotype.Service;

@Service
public class ETACalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates the distance between two geographic points using the Haversine formula.
     */
    public double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Estimates the remaining minutes to arrive at the stop.
     */
    public int estimateTimeToArriveMinutes(double distanceKm, double currentSpeedKmh) {
        if (currentSpeedKmh <= 5.0) return 99; // Bus stopped at a traffic light, stop, or heavy traffic
        return (int) Math.round((distanceKm / currentSpeedKmh) * 60.0);
    }
}