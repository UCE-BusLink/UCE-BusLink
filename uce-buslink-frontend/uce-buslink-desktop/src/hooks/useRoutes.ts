import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchRoutes } from '../services/routeService';
import type { ApiRoute } from '../types';

interface UseRoutesResult {
  routes: ApiRoute[];
  loading: boolean;
  error: string | null;
}

export function useRoutes(): UseRoutesResult {
  const { getToken } = useAuth();
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');
        const page = await fetchRoutes(token);
        if (!cancelled) setRoutes(page.content);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar rutas');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [getToken]);

  return { routes, loading, error };
}
