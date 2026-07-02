import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { apiFetch } from '../services/api';
import { fetchTripById } from '../services/tripService';
import { fetchRouteById } from '../services/routeService';
import type { ApiReservation, ApiTrip, ApiRoute, PageResponse } from '../types';

export interface NextReservationData {
  reservation: ApiReservation;
  trip: ApiTrip;
  route: ApiRoute;
}

interface UseNextReservationResult {
  data: NextReservationData | null;
  loading: boolean;
  error: string | null;
}

export function useNextReservation(): UseNextReservationResult {
  const { getToken } = useAuth();
  const [data, setData] = useState<NextReservationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');

        const page = await apiFetch<PageResponse<ApiReservation>>(
          '/api/v1/reservations/my-history?status=ACTIVE&page=0&size=1',
          token
        );

        if (!page.content || page.content.length === 0) {
          if (!cancelled) { setData(null); setLoading(false); }
          return;
        }

        const reservation = page.content[0];
        const trip = await fetchTripById(token, reservation.tripId);
        const route = await fetchRouteById(token, trip.routeId);

        if (!cancelled) setData({ reservation, trip, route });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar reserva');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken]);

  return { data, loading, error };
}
