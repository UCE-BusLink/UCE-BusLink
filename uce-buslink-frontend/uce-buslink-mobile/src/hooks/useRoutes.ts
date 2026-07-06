import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { fetchRoutes } from '../services/routeService';
import type { ApiRoute } from '../types';

interface UseRoutesResult {
  routes: ApiRoute[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRoutes(): UseRoutesResult {
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      const page = await fetchRoutes(token);
      return page.content;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    routes: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}
