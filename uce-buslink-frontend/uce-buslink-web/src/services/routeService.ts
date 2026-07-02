import { apiFetch } from './api';
import type { ApiRoute, PageResponse } from '../types';

export async function fetchRoutes(
  token: string,
  page = 0,
  size = 20
): Promise<PageResponse<ApiRoute>> {
  return apiFetch<PageResponse<ApiRoute>>(
    `/api/v1/supervisor/fleet/routes?activa=true&page=${page}&size=${size}`,
    token
  );
}

export async function fetchRouteById(
  token: string,
  id: string
): Promise<ApiRoute> {
  return apiFetch<ApiRoute>(`/api/v1/supervisor/fleet/routes/${id}`, token);
}
