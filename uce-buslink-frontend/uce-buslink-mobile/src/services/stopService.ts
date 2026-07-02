import { apiFetch } from './api';
import type { RouteStopDetail } from '../types';

export async function fetchRouteStops(
  token: string,
  routeId: string
): Promise<RouteStopDetail[]> {
  return apiFetch<RouteStopDetail[]>(`/rutas/${routeId}/paradas`, token);
}
