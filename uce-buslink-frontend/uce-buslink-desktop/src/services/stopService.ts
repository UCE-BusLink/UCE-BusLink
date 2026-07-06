import { apiFetch } from './api';
import type { RouteStopDetail } from '../types';

/**
 * HU-244 — Paradas de una ruta (en orden, con coordenadas).
 *
 * Backend PENDIENTE: el módulo de flota hoy solo expone
 * GET /api/v1/supervisor/fleet/stops (todas las paradas, rol ADMIN).
 * Endpoint esperado para estudiante:
 *   GET /rutas/{id}/paradas -> paradas ordenadas de la ruta
 *
 * Mientras tanto la pantalla usa getRouteStops() de mockData.
 */
export async function fetchRouteStops(
  token: string,
  routeId: string
): Promise<RouteStopDetail[]> {
  return apiFetch<RouteStopDetail[]>(`/rutas/${routeId}/paradas`, token);
}
