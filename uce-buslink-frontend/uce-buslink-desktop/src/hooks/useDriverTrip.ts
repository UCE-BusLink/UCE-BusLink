import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchDriverTripById } from '../services/driverService';
import { fetchRouteById } from '../services/routeService';
import type { DriverTripDetailView } from '../types';

export function useDriverTrip(tripId: string) {
  const { getToken } = useAuth();
  const [trip, setTrip] = useState<DriverTripDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const apiTrip = await fetchDriverTripById(token, tripId);
        if (cancelled) return;
        let routeName = 'Ruta sin nombre';
        try {
          const route = await fetchRouteById(token, apiTrip.routeId);
          if (!cancelled) routeName = route.name;
        } catch {
          /* route name is optional */
        }
        if (!cancelled) {
          setTrip({
            id: apiTrip.id,
            routeName,
            state: apiTrip.state,
            departureTime: apiTrip.departureTime,
            estimatedArrivalTime: apiTrip.estimatedArrivalTime,
            availableSeats: apiTrip.availableSeats,
          });
        }
      } catch {
        if (!cancelled) setError('No se pudo cargar el viaje.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [getToken, tripId]);

  return { trip, loading, error };
}
