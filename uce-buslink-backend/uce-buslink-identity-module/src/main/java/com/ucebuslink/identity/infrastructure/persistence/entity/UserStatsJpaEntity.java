package com.ucebuslink.identity.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsJpaEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Column(name = "total_trips", nullable = false)
    private int totalTrips;

    @Column(name = "completed_trips", nullable = false)
    private int completedTrips;

    @Column(name = "total_distance_km", nullable = false)
    private double totalDistanceKm;

    @Column(name = "total_hours_transit", nullable = false)
    private double totalHoursTransit;

    @Column(name = "active_days", nullable = false)
    private int activeDays;
}
