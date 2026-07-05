package com.ucebuslink.reservations.application.port.out;

import java.util.UUID;

public interface ReservationToIdentityPort {
    /**
     * Obtiene el Trust Score actual del estudiante.
     */
    int getStudentTrustScore(UUID studentId);

    /**
     * Obtiene el nombre completo del estudiante.
     */
    String getStudentFullName(UUID studentId);
}
