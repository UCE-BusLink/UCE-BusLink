import { apiFetch } from './api';
import type { ApiSeat, PageResponse } from '../types';

export async function fetchSeatsByTrip(token: string, tripId: string): Promise<ApiSeat[]> {
  const page = await apiFetch<PageResponse<ApiSeat>>(
    `/api/v1/reservations/seats/trip/${tripId}?size=100`,
    token
  );
  return page.content;
}
