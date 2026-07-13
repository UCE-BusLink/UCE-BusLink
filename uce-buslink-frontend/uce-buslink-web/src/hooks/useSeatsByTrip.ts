import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchSeatsByTrip } from '../services/seatService';
import type { ApiSeat } from '../types';

interface UseSeatsByTripResult {
  apiSeats: ApiSeat[];
  loading: boolean;
  error: string | null;
}

export function useSeatsByTrip(tripId: string | undefined): UseSeatsByTripResult {
  const { getToken } = useAuth();

  const { data: apiSeats = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['seats-by-trip', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return await fetchSeatsByTrip(token, tripId);
    },
    enabled: !!tripId,
  });

  const error = queryError instanceof Error ? queryError.message : (queryError ? 'Error al cargar asientos' : null);

  return { apiSeats, loading, error };
}
