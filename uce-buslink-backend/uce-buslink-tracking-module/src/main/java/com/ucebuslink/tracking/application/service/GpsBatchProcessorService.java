package com.ucebuslink.tracking.application.service;

import com.ucebuslink.tracking.application.dto.GpsLocationReceivedEvent;
import com.ucebuslink.tracking.domain.model.GpsLocationHistory;
import com.ucebuslink.tracking.domain.repository.GpsLocationHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

@Slf4j
@Service
@RequiredArgsConstructor
public class GpsBatchProcessorService {

    private final GpsLocationHistoryRepository historyRepository; // Injects the Port (Interface)

    // Thread-safe queue holding the pure Domain Model
    private final Queue<GpsLocationHistory> buffer = new ConcurrentLinkedQueue<>();

    @Async
    @EventListener
    public void handleGpsReceivedEvent(GpsLocationReceivedEvent event) {
        GpsLocationHistory location = new GpsLocationHistory(
                event.tripId(),
                event.latitude(),
                event.longitude(),
                event.accuracy(),
                event.velocity()
        );
        buffer.add(location);
    }

    @Scheduled(fixedRate = 30000)
    public void flushBufferToDatabase() {
        if (buffer.isEmpty()) return;

        List<GpsLocationHistory> batchToSave = new ArrayList<>();
        GpsLocationHistory item;
        while ((item = buffer.poll()) != null) {
            batchToSave.add(item);
        }

        try {
            historyRepository.saveAll(batchToSave);
            log.debug("[TRACKING-HISTORY] Flush successful: {} points saved to DB.", batchToSave.size());
        } catch (Exception e) {
            log.error("[TRACKING-HISTORY] Error saving GPS batch to DB.", e);
        }
    }
}