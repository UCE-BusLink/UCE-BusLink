import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTrackingConnection } from './useTrackingConnection';
import type { ApiRoute } from '../types';
import type { RouteBroadcastMessage } from '../types/realtime';

// Keeps the ['routes'] cache (read by RoutesPage, AdminRoutesPage and this
// layout's own prefetch) in sync in real time: when an admin creates, edits,
// (de)activates or deletes a route, every connected client applies the
// change directly to its cache — no refetch, no polling.
export function useRealtimeRoutes() {
  const { client, isConnected } = useTrackingConnection(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!client || !isConnected) return;

    const subscription = client.subscribe('/topic/routes', (message) => {
      if (!message.body) return;
      const event: RouteBroadcastMessage = JSON.parse(message.body);

      queryClient.setQueryData<ApiRoute[]>(['routes'], (current) => {
        const list = current ?? [];

        if (event.changeType === 'DELETED') {
          return list.filter((r) => r.id !== event.routeId);
        }

        const updated: ApiRoute = {
          id: event.routeId,
          name: event.name ?? '',
          description: event.description,
          isActive: event.isActive ?? true,
          estimatedDurationMinutes: event.estimatedDurationMinutes,
          pathPolyline: event.pathPolyline,
          stops: event.stops,
        };

        const exists = list.some((r) => r.id === event.routeId);
        return exists
          ? list.map((r) => (r.id === event.routeId ? updated : r))
          : [...list, updated];
      });
    });

    return () => subscription.unsubscribe();
  }, [client, isConnected, queryClient]);
}
