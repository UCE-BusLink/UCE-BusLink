package com.ucebuslink.identity.domain.model;

import com.ucebuslink.shared.constant.TrustLevel;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

public class TrustScore {

    private UUID id;
    private UUID userId;
    private int score;
    private TrustLevel level;
    private int totalReservations;
    private int completedReservations;
    private int noShows;
    private int cancellationsLast30Days;
    private int trendLast7Days;
    private LocalDateTime nextReviewAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<TrustPenalty> activePenalties = new ArrayList<>();

    public TrustScore() {
    }

    public TrustScore(UUID id, UUID userId, int score, TrustLevel level, int totalReservations, int completedReservations, int noShows, int cancellationsLast30Days, int trendLast7Days, LocalDateTime nextReviewAt, LocalDateTime createdAt, LocalDateTime updatedAt, List<TrustPenalty> activePenalties) {
        this.id = id;
        this.userId = userId;
        this.score = score;
        this.level = level;
        this.totalReservations = totalReservations;
        this.completedReservations = completedReservations;
        this.noShows = noShows;
        this.cancellationsLast30Days = cancellationsLast30Days;
        this.trendLast7Days = trendLast7Days;
        this.nextReviewAt = nextReviewAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (activePenalties != null) {
            this.activePenalties = activePenalties;
        }
    }

    public static TrustScore createDefault(UUID userId) {
        TrustScore score = new TrustScore();
        score.setUserId(userId);
        score.setScore(100);
        score.setLevel(TrustLevel.EXCELLENT);
        score.setTotalReservations(0);
        score.setCompletedReservations(0);
        score.setNoShows(0);
        score.setCancellationsLast30Days(0);
        score.setTrendLast7Days(0);
        return score;
    }

    public void increaseScore(int points) {
        this.score = Math.min(100, this.score + points);
        updateLevel();
    }

    public void decreaseScore(int points) {
        this.score = Math.max(0, this.score - points);
        updateLevel();
    }

    private void updateLevel() {
        if (this.score >= 90) {
            this.level = TrustLevel.EXCELLENT;
        } else if (this.score >= 70) {
            this.level = TrustLevel.GOOD;
        } else if (this.score >= 50) {
            this.level = TrustLevel.REGULAR;
        } else if (this.score >= 30) {
            this.level = TrustLevel.LOW;
        } else {
            this.level = TrustLevel.CRITICAL;
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    
    public TrustLevel getLevel() { return level; }
    public void setLevel(TrustLevel level) { this.level = level; }
    
    public int getTotalReservations() { return totalReservations; }
    public void setTotalReservations(int totalReservations) { this.totalReservations = totalReservations; }
    
    public int getCompletedReservations() { return completedReservations; }
    public void setCompletedReservations(int completedReservations) { this.completedReservations = completedReservations; }
    
    public int getNoShows() { return noShows; }
    public void setNoShows(int noShows) { this.noShows = noShows; }
    
    public int getCancellationsLast30Days() { return cancellationsLast30Days; }
    public void setCancellationsLast30Days(int cancellationsLast30Days) { this.cancellationsLast30Days = cancellationsLast30Days; }
    
    public int getTrendLast7Days() { return trendLast7Days; }
    public void setTrendLast7Days(int trendLast7Days) { this.trendLast7Days = trendLast7Days; }
    
    public LocalDateTime getNextReviewAt() { return nextReviewAt; }
    public void setNextReviewAt(LocalDateTime nextReviewAt) { this.nextReviewAt = nextReviewAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<TrustPenalty> getActivePenalties() { return activePenalties; }
    public void setActivePenalties(List<TrustPenalty> activePenalties) { this.activePenalties = activePenalties; }
}
