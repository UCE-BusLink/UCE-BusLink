import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
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

  const { data = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['next-reservation'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');

      const page = await apiFetch<PageResponse<ApiReservation>>(
        '/api/v1/reservations/my-history?status=ACTIVE&page=0&size=1',
        token
      );

      if (!page.content || page.content.length === 0) {
        return null;
      }

      const reservation = page.content[0];
      const trip = await fetchTripById(token, reservation.tripId);
      const route = await fetchRouteById(token, trip.routeId);

      return { reservation, trip, route };
    },
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? 'Error al cargar reserva' : null);

  return { data, loading, error };
}
