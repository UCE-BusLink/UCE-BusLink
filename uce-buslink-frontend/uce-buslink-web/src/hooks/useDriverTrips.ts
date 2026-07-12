import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchDriverTrips } from '../services/driverService';
import { fetchRoutes } from '../services/routeService';
import type { DriverTripView } from '../types';

interface UseDriverTripsResult {
  trips: DriverTripView[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDriverTrips(): UseDriverTripsResult {
  const { getToken } = useAuth();

  const { data: trips = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['driver-trips'],
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
          busId: t.busId,
          state: t.state,
          departureTime: t.departureTime,
          availableSeats: t.availableSeats,
        }))
        .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        
      return views;
    },
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? 'No se pudieron cargar los viajes.' : null);

  return { trips, loading, error, refetch };
}
