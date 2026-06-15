import { apiFetch } from './api';

/**
 * HU-161 — Reserva activa y cancelación.
 *
 * Backend PENDIENTE (módulo reservations vacío). Endpoints esperados:
 *   GET    /api/v1/reservations/me   -> reserva activa del estudiante (o null)
 *   POST   /api/v1/reservations      -> crear reserva (asiento o lugar de pie)
 *   DELETE /api/v1/reservations/{id} -> cancelar reserva activa
 *
 * Las pantallas funcionan con mockData hasta que el backend exista.
 */
export interface ActiveReservation {
  id: string;
  routeName: string;
  destination: string;
  time: string;
  seat: string;
  driver: string;
  unit: string;
  date: string;
}

export interface CreateReservationCommand {
  tripId: string;
  seatNumber?: number;
  standingSpotId?: number;
}

export async function fetchActiveReservation(
  token: string
): Promise<ActiveReservation | null> {
  return apiFetch<ActiveReservation | null>('/api/v1/reservations/me', token);
}

export async function createReservation(
  token: string,
  command: CreateReservationCommand
): Promise<ActiveReservation> {
  return apiFetch<ActiveReservation>('/api/v1/reservations', token, {
    method: 'POST',
    body: JSON.stringify(command),
  });
}

export async function cancelReservation(
  token: string,
  reservationId: string
): Promise<void> {
  await apiFetch<void>(`/api/v1/reservations/${reservationId}`, token, {
    method: 'DELETE',
  });
}
