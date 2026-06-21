package com.ucebuslink.reservations.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ucebuslink.shared.constant.ReservationStatus;

public class Reservation {
    private UUID id;
    private UUID userId;
    private UUID tripId;
    private UUID seatId;
    private UUID boardingStopId;
    private ReservationStatus status;
    private String qrCode;
    private String externalReference;
    private LocalDateTime reservedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime boardedAt;
    private String cancelReason;
    private Long version;

    public Reservation() {}

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getTripId() { return tripId; }
    public void setTripId(UUID tripId) { this.tripId = tripId; }
    public UUID getSeatId() { return seatId; }
    public void setSeatId(UUID seatId) { this.seatId = seatId; }
    public UUID getBoardingStopId() { return boardingStopId; }
    public void setBoardingStopId(UUID boardingStopId) { this.boardingStopId = boardingStopId; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public String getExternalReference() { return externalReference; }
    public void setExternalReference(String externalReference) { this.externalReference = externalReference; }
    public LocalDateTime getReservedAt() { return reservedAt; }
    public void setReservedAt(LocalDateTime reservedAt) { this.reservedAt = reservedAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public LocalDateTime getBoardedAt() { return boardedAt; }
    public void setBoardedAt(LocalDateTime boardedAt) { this.boardedAt = boardedAt; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}