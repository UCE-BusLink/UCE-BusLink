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

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      const data = await fetchReservationHistory(token, p, pageSize);
      setItems(data.content);
      setTotalElements(data.totalElements);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, pageSize]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const totalPages = Math.ceil(totalElements / pageSize);
  const refetch = useCallback(() => load(page), [load, page]);

  return { items, loading, page, setPage, totalPages, totalElements, refetch };
}
