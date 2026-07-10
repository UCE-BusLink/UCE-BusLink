import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { fetchDriverTrips } from '../services/driverService';
import { fetchRoutes } from '../services/routeService';
import { useTrackingConnection } from './useTrackingConnection';
import { useCurrentUser } from '../context/AuthContext';
import type { ApiRoute, DriverTripView } from '../types';
import type { TripBroadcastMessage } from '../types/realtime';

export function useDriverTrips() {
  const { getToken } = useAuth();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const { client, isConnected } = useTrackingConnection(true);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['driverTrips'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      const [apiTrips, routesPage] = await Promise.all([
        fetchDriverTrips(token),
        fetchRoutes(token, 0, 100),
      ]);
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
      return views;
    },
  });

  // Real-time updates: a trip assigned to this driver was created/edited/
  // cancelled/started elsewhere. Trips belonging to other drivers are ignored.
  useEffect(() => {
    if (!client || !isConnected || !user?.internalId) return;

    const subscription = client.subscribe('/topic/trips', (message) => {
      if (!message.body) return;
      const event: TripBroadcastMessage = JSON.parse(message.body);
      if (event.driverId !== user.internalId) return;

      queryClient.setQueryData<DriverTripView[]>(['driverTrips'], (current) => {
        const list = current ?? [];
        const routes = queryClient.getQueryData<ApiRoute[]>(['routes']) ?? [];
        const routeName = routes.find((r) => r.id === event.routeId)?.name ?? 'Ruta sin nombre';

        const updated: DriverTripView = {
          id: event.tripId,
          routeId: event.routeId,
          routeName,
          state: event.state,
          departureTime: event.departureTime,
          availableSeats: event.availableSeats,
        };

        const exists = list.some((t) => t.id === event.tripId);
        const next = exists
          ? list.map((t) => (t.id === event.tripId ? updated : t))
          : [...list, updated];
        return next.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      });
    });

    return () => subscription.unsubscribe();
  }, [client, isConnected, queryClient, user?.internalId]);

  return {
    trips: data ?? [],
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => { refetch(); },
  };
}
