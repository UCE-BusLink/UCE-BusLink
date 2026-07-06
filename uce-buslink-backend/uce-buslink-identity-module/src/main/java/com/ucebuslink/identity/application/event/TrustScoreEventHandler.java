package com.ucebuslink.identity.application.event;

import com.ucebuslink.identity.domain.model.TrustScore;
import com.ucebuslink.identity.domain.repository.TrustScoreRepository;
import com.ucebuslink.shared.event.BoardingCompletedEvent;
import com.ucebuslink.shared.event.NoShowEvent;
import com.ucebuslink.shared.event.ReservationCancelledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrustScoreEventHandler {

    private final TrustScoreRepository trustScoreRepository;

    @EventListener
    @Transactional
    public void handleBoardingCompletedEvent(BoardingCompletedEvent event) {
        log.info("[TRUST_SCORE] Manejando BoardingCompletedEvent para usuario {}", event.userId());
        TrustScore trustScore = trustScoreRepository.findByUserId(event.userId())
                .orElseGet(() -> TrustScore.createDefault(event.userId()));

        trustScore.increaseScore(2);
        trustScore.setCompletedReservations(trustScore.getCompletedReservations() + 1);
        trustScoreRepository.save(trustScore);
        log.debug("[TRUST_SCORE] Nuevo score de {}: {}", event.userId(), trustScore.getScore());
    }

    @EventListener
    @Transactional
    public void handleReservationCancelledEvent(ReservationCancelledEvent event) {
        log.info("[TRUST_SCORE] Manejando ReservationCancelledEvent para usuario {}. Late: {}", event.userId(), event.isLateCancellation());
        TrustScore trustScore = trustScoreRepository.findByUserId(event.userId())
                .orElseGet(() -> TrustScore.createDefault(event.userId()));

        trustScore.setCancellationsLast30Days(trustScore.getCancellationsLast30Days() + 1);
        
        if (event.isLateCancellation()) {
            trustScore.decreaseScore(5);
            log.warn("[TRUST_SCORE] Penalización -5 aplicada a {} por cancelación tardía.", event.userId());
        }

        trustScoreRepository.save(trustScore);
    }

    @EventListener
    @Transactional
    public void handleNoShowEvent(NoShowEvent event) {
        log.warn("[TRUST_SCORE] Manejando NoShowEvent para usuario {}", event.userId());
        TrustScore trustScore = trustScoreRepository.findByUserId(event.userId())
                .orElseGet(() -> TrustScore.createDefault(event.userId()));

        trustScore.setNoShows(trustScore.getNoShows() + 1);
        trustScore.decreaseScore(10);
        
        trustScoreRepository.save(trustScore);
        log.error("[TRUST_SCORE] Penalización CRÍTICA -10 aplicada a {} por NO_SHOW. Nuevo score: {}", event.userId(), trustScore.getScore());
    }
}
