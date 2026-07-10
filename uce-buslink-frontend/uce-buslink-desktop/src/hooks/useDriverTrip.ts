import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchDriverTripById } from '../services/driverService';
import { fetchRouteById } from '../services/routeService';
import { useTrackingConnection } from './useTrackingConnection';
import type { DriverTripDetailView } from '../types';
import type { TripBroadcastMessage } from '../types/realtime';

export function useDriverTrip(tripId: string) {
  const { getToken } = useAuth();
  const [trip, setTrip] = useState<DriverTripDetailView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { client, isConnected } = useTrackingConnection(true);

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
            busId: apiTrip.busId,
            routeId: apiTrip.routeId,
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

  // Real-time updates: reflect a state/schedule/bus change made elsewhere
  // (e.g. an admin editing or cancelling this same trip) without refetching.
  useEffect(() => {
    if (!client || !isConnected) return;

    const subscription = client.subscribe('/topic/trips', (message) => {
      if (!message.body) return;
      const event: TripBroadcastMessage = JSON.parse(message.body);
      if (event.tripId !== tripId) return;

      setTrip((current) => current && ({
        ...current,
        busId: event.busId,
        state: event.state,
        departureTime: event.departureTime,
        estimatedArrivalTime: event.estimatedArrivalTime,
        availableSeats: event.availableSeats,
      }));
    });

    return () => subscription.unsubscribe();
  }, [client, isConnected, tripId]);

  return { trip, loading, error, setTrip };
}
