import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchTripById } from '../services/tripService';
import type { ApiTrip } from '../types';

interface UseTripByIdResult {
  trip: ApiTrip | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useTripById(id: string | undefined): UseTripByIdResult {
  const { getToken } = useAuth();

  const { data: trip = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      if (!id) return null;
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return await fetchTripById(token, id);
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.startsWith('404')) return false;
      return failureCount < 3;
    }
  });

  const errorMessage = queryError instanceof Error ? queryError.message : null;
  const notFound = !id || (errorMessage?.startsWith('404') ?? false);
  const error = notFound ? null : errorMessage;

  return { trip, loading, error, notFound };
}
