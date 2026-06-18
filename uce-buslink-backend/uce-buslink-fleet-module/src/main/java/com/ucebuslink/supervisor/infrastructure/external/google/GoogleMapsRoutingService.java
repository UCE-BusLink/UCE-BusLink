package com.ucebuslink.supervisor.infrastructure.external.google;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.DirectionsLeg;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GoogleMapsRoutingService {

    private final GeoApiContext context;

    // Tu API Key debe estar protegida en el archivo application.properties
    public GoogleMapsRoutingService(@Value("${google.maps.api-key}") String apiKey) {
        this.context = new GeoApiContext.Builder()
                .apiKey(apiKey)
                .build();
    }

    public RoutingResult calculateRoute(List<LatLngPoints> stopPoints) {
        try {
            if (stopPoints.size() < 2) {
                throw new IllegalArgumentException("Se requieren al menos 2 paradas (Origen y Destino)");
            }

            // La primera parada es el origen, la última es el destino
            String origin = stopPoints.get(0).latitude() + "," + stopPoints.get(0).longitude();
            String destination = stopPoints.get(stopPoints.size() - 1).latitude() + "," + stopPoints.get(stopPoints.size() - 1).longitude();

            // Las paradas intermedias se configuran como waypoints
            List<String> waypoints = new ArrayList<>();
            for (int i = 1; i < stopPoints.size() - 1; i++) {
                waypoints.add(stopPoints.get(i).latitude() + "," + stopPoints.get(i).longitude());
            }

            // Llamada oficial a la API de Google Maps
            DirectionsResult result = DirectionsApi.newRequest(context)
                    .origin(origin)
                    .destination(destination)
                    .waypoints(waypoints.toArray(new String[0]))
                    .optimizeWaypoints(false) // Mantenemos el orden estricto de la UCE
                    .await();

            if (result.routes.length == 0) {
                throw new RuntimeException("No se encontró una ruta factible en el mapa.");
            }

            DirectionsRoute route = result.routes[0];
            String polyline = route.overviewPolyline.getEncodedPath();

            // Procesar los tiempos acumulados entre paradas
            List<Integer> minutesFromStart = new ArrayList<>();
            int accumulatedSeconds = 0;
            
            // La primera parada empieza en el minuto 0
            minutesFromStart.add(0);

            for (DirectionsLeg leg : route.legs) {
                accumulatedSeconds += leg.duration.inSeconds;
                // Convertimos a minutos y lo agregamos para la siguiente parada
                minutesFromStart.add((int) Math.ceil(accumulatedSeconds / 60.0));
            }

            return new RoutingResult(polyline, minutesFromStart);

        } catch (Exception e) {
            throw new RuntimeException("Error al consultar Google Maps API: " + e.getMessage(), e);
        }
    }

    public record LatLngPoints(double latitude, double longitude) {}
    public record RoutingResult(String polyline, List<Integer> minutesFromStart) {}
}