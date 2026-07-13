package com.ucebuslink.identity.application.cron;

import com.ucebuslink.identity.domain.model.TrustScore;
import com.ucebuslink.identity.domain.repository.TrustScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TrustScoreRecoveryJob {

    private final TrustScoreRepository trustScoreRepository;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void recoverTrustScores() {
        log.info("[TRUST_SCORE_CRON] Starting daily Trust Score recovery process.");
        
        List<TrustScore> scoresToRecover = trustScoreRepository.findByScoreLessThan(100);
        
        if (scoresToRecover.isEmpty()) {
            log.info("[TRUST_SCORE_CRON] No users with score below 100 to recover.");
            return;
        }

        int count = 0;
        for (TrustScore score : scoresToRecover) {
            score.increaseScore(1);
            trustScoreRepository.save(score);
            count++;
        }

        log.info("[TRUST_SCORE_CRON] Process finished. +1 added to {} users.", count);
    }
}
