import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchReservationHistory } from '../services/reservationService';
import type { ReservationHistoryItem } from '../services/reservationService';

export function useReservationHistory(pageSize = 5) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<ReservationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const data = await fetchReservationHistory(token, page, pageSize);
        if (!cancelled) {
          setItems(data.content);
          setTotalElements(data.totalElements);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [getToken, page, pageSize, tick]);

  const totalPages = Math.ceil(totalElements / pageSize);
  const refetch = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { items, loading, page, setPage, totalPages, totalElements, refetch };
}
