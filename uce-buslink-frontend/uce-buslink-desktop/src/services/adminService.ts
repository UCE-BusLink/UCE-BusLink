import { apiFetch } from './api';
import type { PageResponse } from '../types';

export interface ApiBus {
  id: string;
  plateNumber: string;
  internalCode: string;
  seatCapacity: number;
  manufacturer: string;
  model: string;
  operationalStatus: string;
}

export interface ApiStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface ApiDriver {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
}

export interface CreateRoutePayload {
  name: string;
  description: string;
  estimatedDurationMinutes: number;
  pathPolyline: string;
  stops: never[];
}

export interface CreateDriverPayload {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
}

export async function fetchBuses(token: string, page = 0, size = 20): Promise<PageResponse<ApiBus>> {
  return apiFetch<PageResponse<ApiBus>>(
    `/api/v1/supervisor/fleet/buses?page=${page}&size=${size}`,
    token
  );
}

export async function fetchStops(token: string): Promise<ApiStop[]> {
  const result = await apiFetch<PageResponse<ApiStop> | ApiStop[]>(
    '/api/v1/supervisor/fleet/stops?page=0&size=200',
    token
  );
  return Array.isArray(result) ? result : (result.content ?? []);
}

export async function fetchDrivers(token: string): Promise<ApiDriver[]> {
  const result = await apiFetch<PageResponse<ApiDriver> | ApiDriver[]>(
    '/api/v1/admin/drivers',
    token
  );
  return Array.isArray(result) ? result : (result.content ?? []);
}

export async function createRoute(token: string, payload: CreateRoutePayload): Promise<void> {
  await apiFetch<unknown>('/api/v1/supervisor/fleet/routes', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createDriver(token: string, payload: CreateDriverPayload): Promise<void> {
  await apiFetch<unknown>('/api/v1/admin/drivers', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
