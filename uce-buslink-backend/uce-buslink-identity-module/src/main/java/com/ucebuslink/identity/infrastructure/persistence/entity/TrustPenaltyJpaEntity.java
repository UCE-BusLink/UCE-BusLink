package com.ucebuslink.identity.infrastructure.persistence.entity;

import com.ucebuslink.shared.constant.PenaltyStatus;
import com.ucebuslink.shared.constant.PenaltyType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trust_penalties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustPenaltyJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trust_score_id", nullable = false)
    private TrustScoreJpaEntity trustScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PenaltyType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "points_removed", nullable = false)
    private int pointsRemoved;

    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PenaltyStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.startsAt == null) {
            this.startsAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = PenaltyStatus.ACTIVE;
        }
    }
}
