import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { apiFetch } from '../services/api';
import { fetchTripById } from '../services/tripService';
import { fetchRouteById } from '../services/routeService';
import type { ApiReservation, ApiTrip, ActiveReservationItem, PageResponse } from '../types';

interface UseReservationHistoryResult {
  items: ActiveReservationItem[];
  loading: boolean;
  page: number;
  setPage: (page: React.SetStateAction<number>) => void;
  totalPages: number;
  totalElements: number;
  refetch: () => void;
}

export function useReservationHistory(pageSize = 5): UseReservationHistoryResult {
  const { getToken } = useAuth();
  const [page, setPage] = useState(0);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['reservation-history', page, pageSize],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      
      const resPage = await apiFetch<PageResponse<ApiReservation>>(
        `/api/v1/reservations/my-history?page=${page}&size=${pageSize}`,
        token
      );
      
      if (!resPage.content || resPage.content.length === 0) {
        return { items: [] as ActiveReservationItem[], totalElements: resPage.totalElements || 0 };
      }

      const trips = await Promise.all(
        resPage.content.map((r) => fetchTripById(token, r.tripId))
      );

      const routeIds = [...new Set(trips.map((t: ApiTrip) => t.routeId))];
      const routeList = await Promise.all(routeIds.map((id) => fetchRouteById(token, id)));
      const routeMap = Object.fromEntries(routeList.map((r) => [r.id, r]));

      const result: ActiveReservationItem[] = resPage.content.map((reservation, i) => ({
        reservation,
        trip: trips[i],
        route: routeMap[trips[i].routeId],
      }));

      return { items: result, totalElements: resPage.totalElements };
    },
  });

  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.ceil(totalElements / pageSize);

  return { items, loading, page, setPage, totalPages, totalElements, refetch };
}
