package com.ucebuslink.tracking.domain.service;

import org.springframework.stereotype.Service;

@Service
public class ETACalculator {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine.
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
     * Estima los minutos restantes para llegar a la parada.
     */
    public int estimateTimeToArriveMinutes(double distanceKm, double currentSpeedKmh) {
        if (currentSpeedKmh <= 5.0) return 99; // Bus detenido en semáforo, parada o tráfico pesado
        return (int) Math.round((distanceKm / currentSpeedKmh) * 60.0);
    }
}