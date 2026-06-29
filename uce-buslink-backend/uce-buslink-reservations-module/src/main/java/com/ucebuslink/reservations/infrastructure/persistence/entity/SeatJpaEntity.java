package com.ucebuslink.reservations.infrastructure.persistence.entity;

import com.ucebuslink.shared.constant.*;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

import java.util.UUID;

@Entity
@Table(name = "seats", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"trip_id", "seat_number"})
})
public class SeatJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "state", nullable = false, columnDefinition = "seat_state_enum")
    private SeatState state = SeatState.AVAILABLE;

    @Version
    @Column(nullable = false)
    private Long version;

    public SeatJpaEntity() {}

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }

    public Integer getSeatNumber() { return seatNumber; }
    public void setSeatNumber(Integer seatNumber) { this.seatNumber = seatNumber; }

    public SeatState getState() { return state; }
    public void setState(SeatState state) { this.state = state; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}