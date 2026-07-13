import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchTripsByRoute } from '../services/tripService';
import type { ApiTrip } from '../types';

interface UseTripsByRouteResult {
  trips: ApiTrip[];
  loading: boolean;
  error: string | null;
}

export function useTripsByRoute(routeId: string | undefined): UseTripsByRouteResult {
  const { getToken } = useAuth();

  const { data: trips = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['trips-by-route', routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return await fetchTripsByRoute(token, routeId);
    },
    enabled: !!routeId,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  return { trips, loading, error };
}
