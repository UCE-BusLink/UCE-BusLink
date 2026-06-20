package com.ucebuslink.supervisor.application.usecase;

import com.ucebuslink.supervisor.application.dto.trip.CreateTripCommand;
import com.ucebuslink.supervisor.application.dto.trip.TripResponse;

import java.util.List;

public interface ManageTripUseCase {
    List<TripResponse> createTrip(CreateTripCommand command);
}