import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';
import { fetchTripById } from '../services/tripService';
import { fetchRouteById } from '../services/routeService';
import { fetchBasicUserInfo } from '../services/userService';
import type { ApiReservation, ApiTrip, ActiveReservationItem, PageResponse } from '../types';

interface UseActiveReservationsResult {
  items: ActiveReservationItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useActiveReservations(): UseActiveReservationsResult {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['activeReservations'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');

      const page = await apiFetch<PageResponse<ApiReservation>>(
        '/api/v1/reservations/my-history?status=ACTIVE&page=0&size=20',
        token
      );

      if (!page.content || page.content.length === 0) {
        return [];
      }

      const trips = await Promise.all(
        page.content.map((r) => fetchTripById(token, r.tripId))
      );

      const routeIds = [...new Set(trips.map((t: ApiTrip) => t.routeId))];
      const routeList = await Promise.all(routeIds.map((id) => fetchRouteById(token, id)));
      const routeMap = Object.fromEntries(routeList.map((r) => [r.id, r]));

      const driverIds = [...new Set(trips.map((t: ApiTrip) => t.driverId))];
      const driverList = await Promise.all(
        driverIds.map((id) => fetchBasicUserInfo(token, id).catch(() => null))
      );
      const driverMap = Object.fromEntries(
        driverList.filter(Boolean).map((d) => [d!.id, `${d!.nombres} ${d!.apellidos}`])
      );

      const result: ActiveReservationItem[] = page.content.map((reservation, i) => {
        const trip = trips[i];
        return {
          reservation,
          trip,
          route: routeMap[trip.routeId],
          driverName: driverMap[trip.driverId] || 'Conductor asignado',
        };
      });

      result.sort(
        (a, b) =>
          new Date(a.trip.departureTime).getTime() - new Date(b.trip.departureTime).getTime()
      );

      return result;
    },
    staleTime: 60 * 1000,
  });

  return {
    items: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}
