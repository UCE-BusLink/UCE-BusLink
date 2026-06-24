package com.ucebuslink.tracking.application.dto;

import java.util.List;

public record SupervisorSnapshotPayload(
    String type,
    long timestamp,
    List<BusSnapshot> buses,
    NetworkStatistics statisticsSnapshot,
    Metadata metadata
) {
    public SupervisorSnapshotPayload(List<BusSnapshot> buses, NetworkStatistics statisticsSnapshot) {
        this("all_buses_update", System.currentTimeMillis(), buses, statisticsSnapshot, new Metadata(System.currentTimeMillis()));
    }

    public record BusSnapshot(
        String busId,
        String plateNumber,
        double latitude,
        double longitude,
        double velocity,
        String tripId,
        String routeName,
        int occupiedSeats,
        int totalSeats,
        String status,
        long lastUpdate
    ) {}

    public record NetworkStatistics(
        int totalActiveBuses,
        int totalStudentsOnBoard,
        int delayedBuses,
        int availableNetworkSeats
    ) {}

    public record Metadata(long serverTime) {}
}