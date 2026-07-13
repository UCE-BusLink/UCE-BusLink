package com.ucebuslink.notifications.application.listener;

import com.ucebuslink.notifications.application.service.NotificationDispatcherService;
import com.ucebuslink.shared.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationDispatcherService dispatcher;

    // ==========================================
    // RESERVATIONS
    // ==========================================

    @Async
    @EventListener
    public void handleReservationCreated(ReservationCreatedEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "¡Reserva Confirmada! ✅",
            "Tu asiento ha sido asegurado. Abre la app para ver tu código QR.",
            Map.of("url", "/trips"),
            pref -> pref.isNotifyReservationConfirmed()
        );
    }

    @Async
    @EventListener
    public void handleReservationCancelled(ReservationCancelledEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "Reserva Cancelada ❌",
            "Tu reserva ha sido cancelada correctamente.",
            Map.of("url", "/trips"),
            pref -> pref.isNotifyCancellation()
        );
    }

    // ==========================================
    // FLEET AND TRACKING (TRIPS)
    // ==========================================

    @Async
    @EventListener
    public void handleTripStarted(TripStartedEvent event) {
        for (UUID studentId : event.studentIds()) {
            dispatcher.dispatch(
                studentId,
                "¡Tu bus está en camino! 🚌",
                "El viaje ha iniciado. Revisa el mapa en tiempo real.",
                Map.of("url", "/map?tripId=" + event.tripId()),
                pref -> pref.isNotifyBusLeaving()
            );
        }
    }

    @Async
    @EventListener
    public void handleBusApproaching(BusApproachingEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "¡El bus está cerca! 📍",
            "Tu bus llegará a la parada en aproximadamente 3 minutos.",
            Map.of("url", "/map?tripId=" + event.tripId()),
            pref -> pref.isNotifyBusApproaching()
        );
    }

    @Async
    @EventListener
    public void handleTripCompleted(TripCompletedEvent event) {
        for (UUID studentId : event.studentIds()) {
            dispatcher.dispatch(
                studentId,
                "Viaje Finalizado 🏁",
                "El viaje ha terminado. ¡Gracias por viajar con UCE BusLink!",
                Map.of("url", "/trips"),
                pref -> true
            );
        }
    }

    @Async
    @EventListener
    public void handleTripCancelledByAdmin(TripCancelledEvent event) {
        // THIS IS AN EMERGENCY - We skip the preferences and force the send
        for (UUID studentId : event.studentIds()) {
            dispatcher.dispatch(
                studentId,
                "🚨 VIAJE CANCELADO 🚨",
                "Por motivos de fuerza mayor tu viaje ha sido cancelado. Razón: " + event.reason(),
                Map.of("url", "/trips"),
                pref -> true
            );
        }
    }

    // ==========================================
    // BOARDING (QR SCANNED)
    // ==========================================

    @Async
    @EventListener
    public void handleBoardingCompleted(BoardingCompletedEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "¡Bienvenido a bordo! 🎓",
            "Tu código QR fue escaneado con éxito. ¡Buen viaje hacia la UCE!",
            Map.of("url", "/map?tripId=" + event.tripId()),
            pref -> true
        );
    }
}
