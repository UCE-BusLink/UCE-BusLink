import { useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { fetchReservationHistory } from '../services/reservationService';
import type { ReservationHistoryItem } from '../services/reservationService';

export function useReservationHistory(pageSize = 5) {
  const { getToken } = useAuth();
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['reservationHistory', page, pageSize],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      const data = await fetchReservationHistory(token, page, pageSize);
      return data;
    },
    staleTime: 60 * 1000,
  });

  const items = query.data?.content ?? [];
  const totalElements = query.data?.totalElements ?? 0;
  const totalPages = Math.ceil(totalElements / pageSize);

  return {
    items,
    loading: query.isLoading,
    page,
    setPage,
    totalPages,
    totalElements,
    refetch: query.refetch,
  };
}
