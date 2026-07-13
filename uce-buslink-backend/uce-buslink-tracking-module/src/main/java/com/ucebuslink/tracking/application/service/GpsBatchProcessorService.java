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
import java.util.concurrent.LinkedBlockingQueue;

@Slf4j
@Service
@RequiredArgsConstructor
public class GpsBatchProcessorService {

    // Hard ceiling so a delayed flush (e.g. scheduler backlog) can't grow this
    // queue without bound and exhaust the container's memory. Comfortably above
    // normal traffic between two 30s flushes; only ever hit while genuinely backlogged.
    private static final int MAX_BUFFER_SIZE = 5000;

    private final GpsLocationHistoryRepository historyRepository; // Injects the Port (Interface)

    // Thread-safe, capacity-bounded queue holding the pure Domain Model
    private final Queue<GpsLocationHistory> buffer = new LinkedBlockingQueue<>(MAX_BUFFER_SIZE);

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
        if (!buffer.offer(location)) {
            log.warn("[TRACKING-HISTORY] GPS buffer full ({} points); dropping location for trip {}",
                    MAX_BUFFER_SIZE, event.tripId());
        }
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