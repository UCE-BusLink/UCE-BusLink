import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { fetchReservationHistory } from '../services/reservationService';
import type { ReservationHistoryItem } from '../services/reservationService';

export function useReservation() {
  const { getToken } = useAuth();
  const [reservation, setReservation] = useState<ReservationHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) return;
        const data = await fetchReservationHistory(token, 0, 1);
        if (!cancelled) setReservation(data.content[0] ?? null);
      } catch {
        if (!cancelled) setReservation(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { reservation, loading };
}
