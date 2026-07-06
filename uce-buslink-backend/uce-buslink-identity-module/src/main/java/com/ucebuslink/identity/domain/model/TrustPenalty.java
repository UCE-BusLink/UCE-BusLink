package com.ucebuslink.identity.domain.model;

import com.ucebuslink.shared.constant.PenaltyStatus;
import com.ucebuslink.shared.constant.PenaltyType;

import java.time.LocalDateTime;
import java.util.UUID;

public class TrustPenalty {
    
    private UUID id;
    private UUID trustScoreId;
    private PenaltyType type;
    private String reason;
    private int pointsRemoved;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private PenaltyStatus status;
    private LocalDateTime createdAt;

    public TrustPenalty() {
    }

    public TrustPenalty(UUID id, UUID trustScoreId, PenaltyType type, String reason, int pointsRemoved, LocalDateTime startsAt, LocalDateTime expiresAt, PenaltyStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.trustScoreId = trustScoreId;
        this.type = type;
        this.reason = reason;
        this.pointsRemoved = pointsRemoved;
        this.startsAt = startsAt;
        this.expiresAt = expiresAt;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getTrustScoreId() { return trustScoreId; }
    public void setTrustScoreId(UUID trustScoreId) { this.trustScoreId = trustScoreId; }
    
    public PenaltyType getType() { return type; }
    public void setType(PenaltyType type) { this.type = type; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public int getPointsRemoved() { return pointsRemoved; }
    public void setPointsRemoved(int pointsRemoved) { this.pointsRemoved = pointsRemoved; }
    
    public LocalDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDateTime startsAt) { this.startsAt = startsAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public PenaltyStatus getStatus() { return status; }
    public void setStatus(PenaltyStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
