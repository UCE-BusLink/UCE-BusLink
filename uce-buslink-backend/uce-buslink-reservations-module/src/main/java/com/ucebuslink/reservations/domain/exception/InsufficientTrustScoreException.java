package com.ucebuslink.reservations.domain.exception;

public class InsufficientTrustScoreException extends RuntimeException {
    private final int currentScore;
    private final int minimumRequired;

    public InsufficientTrustScoreException(String message, int currentScore, int minimumRequired) {
        super(message);
        this.currentScore = currentScore;
        this.minimumRequired = minimumRequired;
    }

    public int getCurrentScore() {
        return currentScore;
    }

    public int getMinimumRequired() {
        return minimumRequired;
    }
}
