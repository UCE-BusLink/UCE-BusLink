package com.ucebuslink.identity.application.event;

import com.ucebuslink.identity.domain.model.UserStats;
import com.ucebuslink.identity.domain.repository.UserStatsRepository;
import com.ucebuslink.shared.event.BoardingCompletedEvent;
import com.ucebuslink.shared.event.ReservationCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserStatsEventHandler {

    private final UserStatsRepository userStatsRepository;

    @EventListener
    @Transactional
    public void handleReservationCreatedEvent(ReservationCreatedEvent event) {
        log.info("[USER_STATS] Handling ReservationCreatedEvent for User {}", event.userId());
        UserStats userStats = userStatsRepository.findByUserId(event.userId())
                .orElseGet(() -> UserStats.createDefault(event.userId()));

        userStats.addTotalTrip();
        userStatsRepository.save(userStats);
    }

    @EventListener
    @Transactional
    public void handleBoardingCompletedEvent(BoardingCompletedEvent event) {
        log.info("[USER_STATS] Handling BoardingCompletedEvent for User {}", event.userId());
        UserStats userStats = userStatsRepository.findByUserId(event.userId())
                .orElseGet(() -> UserStats.createDefault(event.userId()));

        // As suggested in the plan, since distance/hours are not in the event right now,
        // we'll add an estimated base value. (e.g. 15 km per trip, 1 hour)
        userStats.addCompletedTrip(15.0, 1.0);
        userStatsRepository.save(userStats);
    }
}
