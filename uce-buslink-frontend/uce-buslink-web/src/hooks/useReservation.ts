import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { fetchReservationHistory } from '../services/reservationService';import type { ReservationHistoryItem } from '../services/reservationService';

interface UseReservationResult {
  reservation: ReservationHistoryItem | null;
  loading: boolean;
}

export function useReservation(): UseReservationResult {
  const { getToken } = useAuth();

  const { data: reservation = null, isLoading: loading } = useQuery({
    queryKey: ['latest-reservation'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      
      const data = await fetchReservationHistory(token, 0, 1);
      return data.content[0] ?? null;
    },
  });

  return { reservation, loading };
}
