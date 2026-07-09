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

    // Your API Key must be protected in the application.properties file
    public GoogleMapsRoutingService(@Value("${google.maps.api-key}") String apiKey) {
        this.context = new GeoApiContext.Builder()
                .apiKey(apiKey)
                .build();
    }

    public RoutingResult calculateRoute(List<LatLngPoints> stopPoints) {
        try {
            if (stopPoints.size() < 2) {
                throw new IllegalArgumentException("At least 2 stops are required (Origin and Destination)");
            }

            // The first stop is the origin, the last one is the destination
            String origin = stopPoints.get(0).latitude() + "," + stopPoints.get(0).longitude();
            String destination = stopPoints.get(stopPoints.size() - 1).latitude() + "," + stopPoints.get(stopPoints.size() - 1).longitude();

            // Intermediate stops are configured as waypoints
            List<String> waypoints = new ArrayList<>();
            for (int i = 1; i < stopPoints.size() - 1; i++) {
                waypoints.add(stopPoints.get(i).latitude() + "," + stopPoints.get(i).longitude());
            }

            // Official call to the Google Maps API
            DirectionsResult result = DirectionsApi.newRequest(context)
                    .origin(origin)
                    .destination(destination)
                    .waypoints(waypoints.toArray(new String[0]))
                    .optimizeWaypoints(false) // We keep the strict UCE order
                    .await();

            if (result.routes.length == 0) {
                throw new RuntimeException("No feasible route was found on the map.");
            }

            DirectionsRoute route = result.routes[0];
            String polyline = route.overviewPolyline.getEncodedPath();

            // Process the accumulated times between stops
            List<Integer> minutesFromStart = new ArrayList<>();
            int accumulatedSeconds = 0;

            // The first stop starts at minute 0
            minutesFromStart.add(0);

            for (DirectionsLeg leg : route.legs) {
                accumulatedSeconds += leg.duration.inSeconds;
                // Convert to minutes and add it for the next stop
                minutesFromStart.add((int) Math.ceil(accumulatedSeconds / 60.0));
            }

            return new RoutingResult(polyline, minutesFromStart);

        } catch (Exception e) {
            throw new RuntimeException("Error querying Google Maps API: " + e.getMessage(), e);
        }
    }

    public record LatLngPoints(double latitude, double longitude) {}
    public record RoutingResult(String polyline, List<Integer> minutesFromStart) {}
}