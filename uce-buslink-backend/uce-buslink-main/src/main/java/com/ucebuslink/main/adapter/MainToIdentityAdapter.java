package com.ucebuslink.main.adapter;

import com.ucebuslink.reservations.application.port.out.ReservationToIdentityPort;
import com.ucebuslink.identity.domain.repository.TrustScoreRepository;
import com.ucebuslink.identity.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MainToIdentityAdapter implements ReservationToIdentityPort {

    private final TrustScoreRepository trustScoreRepository;
    private final UserRepository userRepository;

    @Override
    public int getStudentTrustScore(UUID studentId) {
        return trustScoreRepository.findByUserId(studentId)
                .map(com.ucebuslink.identity.domain.model.TrustScore::getScore)
                .orElse(100); // Default to 100 if no score exists yet
    }

    @Override
    public String getStudentFullName(UUID studentId) {
        return userRepository.findById(studentId)
                .map(u -> {
                    String firstName = u.getFirstName() != null ? u.getFirstName().trim().split("\\s+")[0] : "";
                    String lastName = u.getLastName() != null ? u.getLastName().trim().split("\\s+")[0] : "";
                    return (firstName + " " + lastName).trim();
                })
                .orElse("Estudiante Desconocido");
    }
}
