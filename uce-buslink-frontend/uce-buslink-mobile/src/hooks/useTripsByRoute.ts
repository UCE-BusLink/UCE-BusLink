import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { fetchTripsByRoute } from '../services/tripService';
import type { ApiTrip } from '../types';

interface UseTripsByRouteResult {
  trips: ApiTrip[];
  loading: boolean;
  error: string | null;
}

export function useTripsByRoute(routeId: string | undefined): UseTripsByRouteResult {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['trips', routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      const data = await fetchTripsByRoute(token, routeId);
      return data;
    },
    enabled: !!routeId,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    trips: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
  };
}
