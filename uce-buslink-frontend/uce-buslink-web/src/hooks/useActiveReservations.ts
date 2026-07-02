import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { apiFetch } from '../services/api';
import { fetchTripById } from '../services/tripService';
import { fetchRouteById } from '../services/routeService';
import type { ApiReservation, ApiTrip, ActiveReservationItem, PageResponse } from '../types';

interface UseActiveReservationsResult {
  items: ActiveReservationItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActiveReservations(includeBoardedOngoing = false): UseActiveReservationsResult {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ActiveReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');

        const historyPath = includeBoardedOngoing
          ? '/api/v1/reservations/my-history?page=0&size=20'
          : '/api/v1/reservations/my-history?status=ACTIVE&page=0&size=20';

        const page = await apiFetch<PageResponse<ApiReservation>>(historyPath, token);

        if (!page.content || page.content.length === 0) {
          if (!cancelled) { setItems([]); setLoading(false); }
          return;
        }

        const trips = await Promise.all(
          page.content.map((r) => fetchTripById(token, r.tripId))
        );

        const routeIds = [...new Set(trips.map((t: ApiTrip) => t.routeId))];
        const routeList = await Promise.all(routeIds.map((id) => fetchRouteById(token, id)));
        const routeMap = Object.fromEntries(routeList.map((r) => [r.id, r]));

        let result: ActiveReservationItem[] = page.content.map((reservation, i) => ({
          reservation,
          trip: trips[i],
          route: routeMap[trips[i].routeId],
        }));

        if (includeBoardedOngoing) {
          result = result.filter(
            (item) =>
              item.reservation.status === 'ACTIVE' ||
              (item.reservation.status === 'COMPLETED' && item.trip.state === 'ONGOING')
          );
        }

        result.sort(
          (a, b) =>
            new Date(a.trip.departureTime).getTime() - new Date(b.trip.departureTime).getTime()
        );

        if (!cancelled) setItems(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar reservas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken, tick, includeBoardedOngoing]);

  return { items, loading, error, refetch };
}
