import { apiFetch } from './api';
import type { ApiTrip, PageResponse } from '../types';

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
  firstName: string;
  lastName: string;
  email: string;
}

export interface RouteStopPayload {
  stopId: string;
  stopOrder: number;
  estimatedMinutesFromStart: number;
  stopDurationMinutes: number;
}

export interface CreateRoutePayload {
  name: string;
  description: string;
  estimatedDurationMinutes: number;
  pathPolyline: string;
  stops: RouteStopPayload[];
}

export interface CreateDriverPayload {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
}

export interface CreateTripPayload {
  routeId: string;
  busId: string;
  driverId: string;
  departures: string[];
}

export interface CreateBusPayload {
  plateNumber: string;
  internalCode: string;
  seatCapacity: number;
  manufacturer: string;
  model: string;
  operationalStatus: string;
}

export interface BatchStop {
  name: string;
  latitude: number;
  longitude: number;
}

export interface SchedulePayload {
  routeId: string;
  details: {
    type: string;
    daysOfWeek: string[];
    fixedDepartureTimes: string[];
    frequencyStartTime: string | null;
    frequencyEndTime: string | null;
    frequencyIntervalMinutes: number | null;
  }[];
}

export async function fetchRouteSchedules(token: string, routeId: string): Promise<any[]> {
  // Asegúrate de que esta URL coincida con tu configuración base (proxy o url completa)
  const response = await fetch(`/api/v1/supervisor/fleet/schedules/route/${routeId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Error al obtener horarios de la ruta');
  return response.json();
}

export async function fetchBuses(token: string, page = 0, size = 20): Promise<PageResponse<ApiBus>> {
  return apiFetch<PageResponse<ApiBus>>(
    `/api/v1/supervisor/fleet/buses/buses?page=${page}&size=${size}`,
    token
  );
}

export async function createBus(token: string, payload: CreateBusPayload): Promise<void> {
  await apiFetch<unknown>('/api/v1/supervisor/fleet/buses', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

// Actualizado para devolver { id: string } necesario para el wizard
export async function createRoute(token: string, payload: CreateRoutePayload): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/v1/supervisor/fleet/routes', token, {
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

export async function fetchTrips(token: string): Promise<ApiTrip[]> {
  const result = await apiFetch<PageResponse<ApiTrip> | ApiTrip[]>(
    '/api/v1/supervisor/trips?page=0&size=50',
    token
  );
  return Array.isArray(result) ? result : (result.content ?? []);
}

export async function createTrip(token: string, payload: CreateTripPayload): Promise<void> {
  await apiFetch<unknown>('/api/v1/supervisor/trips', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- FUNCIONES NUEVAS DEL WIZARD (Corregidas para usar apiFetch) ---

export async function createBatchStops(token: string, stops: BatchStop[]) {
  return apiFetch<any[]>('/api/v1/supervisor/fleet/stops/batch', token, {
    method: 'POST',
    body: JSON.stringify(stops),
  });
}

export async function previewRoute(token: string, waypoints: { stopId: string }[]) {
  return apiFetch<any>('/api/v1/supervisor/fleet/routes/preview', token, {
    method: 'POST',
    body: JSON.stringify({ waypoints }),
  });
}

export async function createSchedule(token: string, schedule: SchedulePayload) {
  return apiFetch<any>('/api/v1/supervisor/fleet/schedules', token, {
    method: 'POST',
    body: JSON.stringify(schedule),
  });
}

// Agrega estas interfaces junto a las demás
export interface RouteDailyReport {
  total_reservations: number;
  route_id: string;
  route_name: string;
  operation_date: string;
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  total_boardings: number;
  cancelled_by_student: number;
  cancelled_by_admin: number;
  no_shows: number;
  total_incidents: number;
}

// Agrega esta función para consumir el endpoint de reportes diarios
export async function fetchDailyRouteReports(token: string, page = 0, size = 5): Promise<PageResponse<RouteDailyReport>> {
  return apiFetch<PageResponse<RouteDailyReport>>(
    `/api/v1/supervisor/reports/routes/daily?page=${page}&size=${size}`,
    token
  );
}