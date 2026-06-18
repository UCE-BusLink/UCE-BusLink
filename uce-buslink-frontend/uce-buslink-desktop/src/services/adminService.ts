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

export async function fetchBuses(token: string, page = 0, size = 20): Promise<PageResponse<ApiBus>> {
  return apiFetch<PageResponse<ApiBus>>(
    `/api/v1/supervisor/fleet/buses?page=${page}&size=${size}`,
    token
  );
}

export async function fetchStops(token: string): Promise<ApiStop[]> {
  return apiFetch<ApiStop[]>('/api/v1/supervisor/fleet/stops', token);
}
