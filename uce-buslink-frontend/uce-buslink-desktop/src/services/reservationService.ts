import { apiFetch } from './api';
import type { ApiReservation } from '../types';

export interface ReservationHistoryItem {
  id: string;
  routeName: string;
  destination: string;
  time: string;
  seat: string;
  driver: string;
  unit: string;
  date: string;
  qrCode: string;
  status: string;
}

export interface CreateReservationCommand {
  tripId: string;
  seatId: string;
  boardingStopId: string;
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
): Promise<ApiReservation> {
  return apiFetch<ApiReservation>('/api/v1/reservations', token, {
    method: 'POST',
    body: JSON.stringify(command),
  });
}

export async function cancelReservation(
  token: string,
  reservationId: string,
  reason: string
): Promise<void> {
  await apiFetch<void>(`/api/v1/reservations/${reservationId}/cancel`, token, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}
