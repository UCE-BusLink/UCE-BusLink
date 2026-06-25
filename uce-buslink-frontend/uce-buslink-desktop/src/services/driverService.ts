import { apiFetch } from './api';
import type { ApiTrip, PageResponse } from '../types';

export async function fetchDriverTrips(token: string): Promise<ApiTrip[]> {
  const result = await apiFetch<PageResponse<ApiTrip> | ApiTrip[]>(
    '/api/v1/supervisor/trips?page=0&size=50',
    token
  );
  return Array.isArray(result) ? result : (result.content ?? []);
}

export async function fetchDriverTripById(token: string, tripId: string): Promise<ApiTrip> {
  return apiFetch<ApiTrip>(`/api/v1/supervisor/trips/${tripId}`, token);
}

export async function scanReservation(token: string, reservationId: string): Promise<void> {
  await apiFetch<void>(`/api/v1/reservations/${reservationId}/scan`, token, {
    method: 'PATCH',
  });
}

export async function adminCancelReservation(
  token: string,
  reservationId: string,
  reason: string
): Promise<void> {
  await apiFetch<void>(`/api/v1/reservations/${reservationId}/admin-cancel`, token, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}
