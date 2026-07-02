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
  const page = await apiFetch<{ content: ApiTrip[] }>(
    `/api/v1/supervisor/trips?routeId=${routeId}&page=0&size=${size}`,
    token
  );
  return page.content;
}

export async function fetchTripById(token: string, tripId: string): Promise<ApiTrip> {
  return apiFetch<ApiTrip>(`/api/v1/supervisor/trips/${tripId}`, token);
}
