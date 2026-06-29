package com.ucebuslink.supervisor.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Immutable // Crucial: Le dice a Hibernate que NUNCA intente hacer un UPDATE o INSERT aquí
@Table(name = "daily_route_stats")
@Getter
@NoArgsConstructor
public class DailyRouteStatsJpaEntity {

    @Id
    @Column(name = "route_id")
    private UUID routeId;

    @Column(name = "route_name")
    private String routeName;

    @Column(name = "stat_date")
    private LocalDate statDate;

    @Column(name = "total_scheduled_trips")
    private Long totalScheduledTrips;

    @Column(name = "completed_trips")
    private Long completedTrips;

    @Column(name = "cancelled_trips")
    private Long cancelledTrips;

    @Column(name = "average_occupied_seats")
    private Double averageOccupiedSeats;
}