package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.shared.constant.TripState;
import com.ucebuslink.supervisor.application.dto.trip.ChangeTripStateCommand;
import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;
import com.ucebuslink.supervisor.application.dto.trip.UpdateTripCommand;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

public interface ManageTripUseCase {
    List<TripResponse> createTrip(CreateTripCommand command);
    TripResponse getTripById(UUID id);
    Page<TripResponse> getAllTrips(int page, int size);
    TripResponse updateTrip(UUID id, UpdateTripCommand command);
    TripResponse changeTripState(UUID id, ChangeTripStateCommand command);
    void cancelTrip(UUID id);

    Page<TripResponse> getTripsByState(TripState state, int page, int size);
    Page<TripResponse> getTripsByRouteId(UUID routeId, int page, int size);
    Page<TripResponse> getTripsByDriverId(UUID driverId, int page, int size);
}