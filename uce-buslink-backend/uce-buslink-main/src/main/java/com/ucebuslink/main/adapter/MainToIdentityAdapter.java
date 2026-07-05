package com.ucebuslink.main.adapter;

import com.ucebuslink.reservations.application.port.out.ReservationToIdentityPort;
import com.ucebuslink.identity.domain.repository.TrustScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MainToIdentityAdapter implements ReservationToIdentityPort {

    private final TrustScoreRepository trustScoreRepository;

    @Override
    public int getStudentTrustScore(UUID studentId) {
        return trustScoreRepository.findByUserId(studentId)
                .map(com.ucebuslink.identity.domain.model.TrustScore::getScore)
                .orElse(100); // Default to 100 if no score exists yet
    }
}
