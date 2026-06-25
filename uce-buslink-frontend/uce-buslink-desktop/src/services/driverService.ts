import { apiFetch } from './api';
import type { ApiDriverTrip, DriverPassenger } from '../types';

export async function fetchDriverTrips(token: string): Promise<ApiDriverTrip[]> {
  return apiFetch<ApiDriverTrip[]>('/api/v1/driver/trips', token);
}

export async function fetchTripPassengers(
  token: string,
  tripId: string
): Promise<DriverPassenger[]> {
  return apiFetch<DriverPassenger[]>(`/api/v1/driver/trips/${tripId}/reservations`, token);
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
