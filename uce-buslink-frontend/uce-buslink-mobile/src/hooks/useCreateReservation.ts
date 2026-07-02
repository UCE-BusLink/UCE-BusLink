import { useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createReservation } from '../services/reservationService';
import type { ApiReservation } from '../types';

interface UseCreateReservationResult {
  confirm: (tripId: string, seatId: string, boardingStopId: string) => Promise<ApiReservation | null>;
  loading: boolean;
  error: string | null;
}

export function useCreateReservation(): UseCreateReservationResult {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(
    tripId: string,
    seatId: string,
    boardingStopId: string
  ): Promise<ApiReservation | null> {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return await createReservation(token, { tripId, seatId, boardingStopId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la reserva');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { confirm, loading, error };
}
