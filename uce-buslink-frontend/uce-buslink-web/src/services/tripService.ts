import { apiFetch } from './api';
import type { Trip, ApiTrip } from '../types';

export async function fetchAvailableTrips(token: string): Promise<Trip[]> {
  return apiFetch<Trip[]>('/api/v1/trips?activa=true', token);
}

export async function fetchTripsByRoute(
  token: string,
  routeId: string,
  size = 20
): Promise<ApiTrip[]> {
  const result = await apiFetch<any>(
    `/api/v1/supervisor/trips?routeId=${routeId}&page=0&size=${size}`,
    token
  );
  return Array.isArray(result) ? result : (result.content ?? []);
}

export async function fetchTripById(token: string, tripId: string): Promise<ApiTrip> {
  return apiFetch<ApiTrip>(`/api/v1/supervisor/trips/${tripId}`, token);
}

export async function fetchBusById(token: string, busId: string): Promise<{ plateNumber: string, internalCode: string, seatCapacity: number }> {
  return apiFetch<{ plateNumber: string, internalCode: string, seatCapacity: number }>(`/api/v1/supervisor/fleet/buses/${busId}`, token);
}

export async function fetchBasicUserInfo(token: string, userId: string): Promise<{ id: string, firstName: string, lastName: string }> {
  return apiFetch<{ id: string, firstName: string, lastName: string }>(`/api/v1/users/${userId}/basic`, token);
}
