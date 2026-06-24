import { apiFetch } from './api';
import type { Trip, ApiTrip } from '../types';

/**
 * HU-159 — Selección de viajes.
 *
 * Backend PENDIENTE (módulo reservations aún vacío). Endpoints esperados:
 *   GET /api/v1/trips?activa=true              -> viajes disponibles
 *   GET /api/v1/trips?routeId={id}&activa=true -> viajes de una ruta
 *
 * Mientras no exista el backend, las pantallas usan mockData.
 * Al estar listo, basta con llamar a estas funciones desde un hook.
 */
export async function fetchAvailableTrips(token: string): Promise<Trip[]> {
  return apiFetch<Trip[]>('/api/v1/trips?activa=true', token);
}

export async function fetchTripsByRoute(
  token: string,
  routeId: string
): Promise<Trip[]> {
  return apiFetch<Trip[]>(
    `/api/v1/trips?routeId=${routeId}&activa=true`,
    token
  );
}

export async function fetchTripById(token: string, tripId: string): Promise<ApiTrip> {
  return apiFetch<ApiTrip>(`/api/v1/supervisor/trips/${tripId}`, token);
}
