import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
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
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  return { routes, loading, error, refetch };
}
