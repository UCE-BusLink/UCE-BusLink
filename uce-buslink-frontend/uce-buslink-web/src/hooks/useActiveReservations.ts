import { useQuery } from '@tanstack/react-query';
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

  const { data: items = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['active-reservations', includeBoardedOngoing],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');

      const historyPath = includeBoardedOngoing
        ? '/api/v1/reservations/my-history?page=0&size=20'
        : '/api/v1/reservations/my-history?status=ACTIVE&page=0&size=20';

      const page = await apiFetch<PageResponse<ApiReservation>>(historyPath, token);
      const content = Array.isArray(page) ? page : (page.content || []);

      if (content.length === 0) {
        return [];
      }

      const trips = await Promise.all(
        content.map((r) => fetchTripById(token, r.tripId))
      );

      const routeIds = [...new Set(trips.map((t: ApiTrip) => t.routeId))];
      const routeList = await Promise.all(routeIds.map((id) => fetchRouteById(token, id)));
      const routeMap = Object.fromEntries(routeList.map((r) => [r.id, r]));

      let result: ActiveReservationItem[] = content.map((reservation, i) => ({
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

      return result;
    },
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? 'Error al cargar reservas' : null);

  return { items, loading, error, refetch };
}
