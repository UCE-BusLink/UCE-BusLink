import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchDriverTrips } from '../services/driverService';
import { fetchRoutes } from '../services/routeService';
import type { DriverTripView } from '../types';

export function useDriverTrips() {
  const { getToken } = useAuth();
  const [trips, setTrips] = useState<DriverTripView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const [apiTrips, routesPage] = await Promise.all([
          fetchDriverTrips(token),
          fetchRoutes(token, 0, 100),
        ]);
        if (cancelled) return;
        const routeNames = new Map(routesPage.content.map((r) => [r.id, r.name]));
        const views: DriverTripView[] = apiTrips
          .map((t) => ({
            id: t.id,
            routeId: t.routeId,
            routeName: routeNames.get(t.routeId) ?? 'Ruta sin nombre',
            state: t.state,
            departureTime: t.departureTime,
            availableSeats: t.availableSeats,
          }))
          .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        setTrips(views);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los viajes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [getToken, tick]);

  const refetch = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { trips, loading, error, refetch };
}
