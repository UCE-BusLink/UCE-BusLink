package com.ucebuslink.identity.infrastructure.persistence.entity;

import com.ucebuslink.shared.constant.TrustLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "trust_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrustScoreJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private int score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrustLevel level;

    @Column(name = "total_reservations", nullable = false)
    private int totalReservations;

    @Column(name = "completed_reservations", nullable = false)
    private int completedReservations;

    @Column(name = "no_shows", nullable = false)
    private int noShows;

    @Column(name = "cancellations_last_30_days", nullable = false)
    private int cancellationsLast30Days;

    @Column(name = "trend_last_7_days", nullable = false)
    private int trendLast7Days;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "trustScore", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TrustPenaltyJpaEntity> penalties = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.level == null) {
            this.level = TrustLevel.EXCELLENT;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
