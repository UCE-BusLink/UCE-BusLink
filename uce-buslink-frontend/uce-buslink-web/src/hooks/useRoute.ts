import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchRouteById } from '../services/routeService';
import type { ApiRoute } from '../types';

interface UseRouteResult {
  route: ApiRoute | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useRoute(id: string | undefined): UseRouteResult {
  const { getToken } = useAuth();

  const { data: route = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['route', id],
    queryFn: async () => {
      if (!id) return null;
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return await fetchRouteById(token, id);
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

  return { route, loading, error, notFound };
}
