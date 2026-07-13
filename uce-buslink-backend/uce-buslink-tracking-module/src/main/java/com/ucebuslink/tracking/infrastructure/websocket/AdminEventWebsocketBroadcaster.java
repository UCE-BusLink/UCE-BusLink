package com.ucebuslink.tracking.infrastructure.websocket;

import com.ucebuslink.shared.event.AdminEntityChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminEventWebsocketBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onAdminEntityChanged(AdminEntityChangedEvent event) {
        log.info("[WEBSOCKET] Broadcasting admin entity change: {} {} (ID: {})", 
                event.entityType(), event.action(), event.entityId());
        
        messagingTemplate.convertAndSend("/topic/admin", event);
    }
}
