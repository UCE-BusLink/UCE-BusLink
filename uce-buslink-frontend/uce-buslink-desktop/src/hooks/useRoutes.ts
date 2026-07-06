import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchRoutes } from '../services/routeService';
import type { ApiRoute } from '../types';

interface UseRoutesResult {
  routes: ApiRoute[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRoutes(): UseRoutesResult {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      const page = await fetchRoutes(token);
      return page.content;
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  return {
    routes: data || [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
