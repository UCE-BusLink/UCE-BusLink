package com.ucebuslink.notifications.application.listener;

import com.ucebuslink.notifications.application.service.NotificationDispatcherService;
import com.ucebuslink.shared.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationDispatcherService dispatcher;

    // ==========================================
    // RESERVAS
    // ==========================================

    @Async
    @EventListener
    public void handleReservationCreated(ReservationCreatedEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "¡Reserva Confirmada! ✅",
            "Tu asiento ha sido asegurado. Abre la app para ver tu código QR.",
            pref -> pref.isNotifyReservationConfirmed() // Chequea el booleano
        );
    }

    @Async
    @EventListener
    public void handleReservationCancelled(ReservationCancelledEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "Reserva Cancelada ❌",
            "Tu reserva ha sido cancelada correctamente.",
            pref -> pref.isNotifyCancellation() // Chequea el booleano
        );
    }

    // ==========================================
    // FLOTA Y TRACKING (VIAJES)
    // ==========================================

    @Async
    @EventListener
    public void handleTripStarted(TripStartedEvent event) {
        // Asumiendo que el evento trae una lista de userIds de todos los que reservaron
        for (java.util.UUID studentId : event.studentIds()) {
            dispatcher.dispatch(
                studentId,
                "¡Tu bus está en camino! 🚌",
                "El viaje ha iniciado. Revisa el mapa en tiempo real.",
                pref -> pref.isNotifyBusLeaving() // Chequea el booleano
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
            pref -> pref.isNotifyBusApproaching() // Chequea el booleano
        );
    }

    @Async
    @EventListener
    public void handleTripCancelledByAdmin(TripCancelledEvent event) {
        // ESTO ES UNA EMERGENCIA - Omitimos las preferencias y forzamos el envío
        for (java.util.UUID studentId : event.studentIds()) {
            dispatcher.dispatch(
                studentId,
                "🚨 VIAJE CANCELADO 🚨",
                "Por motivos de fuerza mayor tu viaje ha sido cancelado. Razón: " + event.reason(),
                pref -> true // Forzamos a TRUE porque es información crítica
            );
        }
    }

    // ==========================================
    // ABORDAJE (QR SCANNED)
    // ==========================================

    @Async
    @EventListener
    public void handleBoardingCompleted(BoardingCompletedEvent event) {
        dispatcher.dispatch(
            event.userId(),
            "¡Bienvenido a bordo! 🎓",
            "Tu código QR fue escaneado con éxito. ¡Buen viaje hacia la UCE!",
            pref -> true // Siempre enviamos recibo de abordaje
        );
    }
}