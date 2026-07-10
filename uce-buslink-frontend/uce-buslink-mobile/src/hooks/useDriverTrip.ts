import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDriverTripById } from '../services/driverService';
import { fetchRouteById } from '../services/routeService';
import { useTrackingConnection } from './useTrackingConnection';
import type { DriverTripDetailView } from '../types';
import type { TripBroadcastMessage } from '../types/realtime';

export function useDriverTrip(tripId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { client, isConnected } = useTrackingConnection(true);

  const { data: trip, isLoading: loading, error: queryError } = useQuery<DriverTripDetailView, Error>({
    queryKey: ['driverTrip', tripId],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      
      const apiTrip = await fetchDriverTripById(token, tripId);
      let routeName = 'Ruta sin nombre';
      try {
        const route = await fetchRouteById(token, apiTrip.routeId);
        routeName = route.name;
      } catch {
        /* route name is optional */
      }
      return {
        id: apiTrip.id,
        busId: apiTrip.busId,
        routeId: apiTrip.routeId,
        routeName,
        state: apiTrip.state,
        departureTime: apiTrip.departureTime,
        estimatedArrivalTime: apiTrip.estimatedArrivalTime,
        availableSeats: apiTrip.availableSeats,
      };
    },
    enabled: !!tripId,
  });

  const error = queryError ? 'No se pudo cargar el viaje.' : null;

  const setTrip = (newTrip: DriverTripDetailView | ((prev: DriverTripDetailView | undefined) => DriverTripDetailView | undefined)) => {
    queryClient.setQueryData(['driverTrip', tripId], newTrip);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, isConnected, tripId]);

  return { trip: trip ?? null, loading, error, setTrip };
}
