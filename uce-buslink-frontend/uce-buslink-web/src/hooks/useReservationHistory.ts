import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiFetch } from '../services/api';
import { fetchTripById } from '../services/tripService';
import { fetchRouteById } from '../services/routeService';
import type { ApiReservation, ApiTrip, ActiveReservationItem, PageResponse } from '../types';

export function useReservationHistory(pageSize = 5) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ActiveReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        
        const resPage = await apiFetch<PageResponse<ApiReservation>>(
          `/api/v1/reservations/my-history?page=${page}&size=${pageSize}`,
          token
        );
        
        if (!resPage.content || resPage.content.length === 0) {
          if (!cancelled) {
            setItems([]);
            setTotalElements(resPage.totalElements || 0);
          }
          return;
        }

        const trips = await Promise.all(
          resPage.content.map((r) => fetchTripById(token, r.tripId))
        );

        const routeIds = [...new Set(trips.map((t: ApiTrip) => t.routeId))];
        const routeList = await Promise.all(routeIds.map((id) => fetchRouteById(token, id)));
        const routeMap = Object.fromEntries(routeList.map((r) => [r.id, r]));

        const result: ActiveReservationItem[] = resPage.content.map((reservation, i) => ({
          reservation,
          trip: trips[i],
          route: routeMap[trips[i].routeId],
        }));

        if (!cancelled) {
          setItems(result);
          setTotalElements(resPage.totalElements);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [getToken, page, pageSize, tick]);

  const totalPages = Math.ceil(totalElements / pageSize);
  const refetch = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { items, loading, page, setPage, totalPages, totalElements, refetch };
}
