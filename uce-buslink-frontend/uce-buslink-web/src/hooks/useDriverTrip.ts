import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchDriverTripById } from '../services/driverService';
import { fetchRouteById } from '../services/routeService';
import type { DriverTripDetailView } from '../types';

interface UseDriverTripResult {
  trip: DriverTripDetailView | null;
  loading: boolean;
  error: string | null;
  setTrip: (newTripOrUpdater: React.SetStateAction<DriverTripDetailView | null>) => void;
}

export function useDriverTrip(tripId: string): UseDriverTripResult {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: trip = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['driver-trip', tripId],
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
      } as DriverTripDetailView;
    },
    enabled: !!tripId,
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? 'No se pudo cargar el viaje.' : null);

  const setTrip = (newTripOrUpdater: React.SetStateAction<DriverTripDetailView | null>) => {
    queryClient.setQueryData(['driver-trip', tripId], newTripOrUpdater);
  };

  return { trip, loading, error, setTrip };
}
