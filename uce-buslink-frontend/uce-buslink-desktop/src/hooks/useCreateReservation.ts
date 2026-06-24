import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createReservation } from '../services/reservationService';

interface UseCreateReservationResult {
  confirm: (tripId: string, seatId: string, boardingStopId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useCreateReservation(): UseCreateReservationResult {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(tripId: string, seatId: string, boardingStopId: string): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      await createReservation(token, { tripId, seatId, boardingStopId });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { confirm, loading, error };
}
