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
export interface ReservationHistoryItem {
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

export async function fetchReservationHistory(
  token: string,
  page = 0,
  size = 10
): Promise<{ content: ReservationHistoryItem[]; totalElements: number }> {
  return apiFetch(`/api/v1/reservations/my-history?page=${page}&size=${size}`, token);
}

export async function createReservation(
  token: string,
  command: CreateReservationCommand
): Promise<ReservationHistoryItem> {
  return apiFetch<ReservationHistoryItem>('/api/v1/reservations', token, {
    method: 'POST',
    body: JSON.stringify(command),
  });
}

export async function cancelReservation(
  token: string,
  reservationId: string
): Promise<void> {
  await apiFetch<void>(`/api/v1/reservations/${reservationId}/cancel`, token, {
    method: 'DELETE',
  });
}
