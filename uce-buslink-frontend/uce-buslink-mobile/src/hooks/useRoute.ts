import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
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
  const [route, setRoute] = useState<ApiRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('No auth token');
        const data = await fetchRouteById(token, id);
        if (!cancelled) setRoute(data);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Error al cargar la ruta';
        if (message.startsWith('404')) setNotFound(true);
        else setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { route, loading, error, notFound };
}
