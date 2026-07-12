import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTrackingConnection } from './useTrackingConnection';

interface AdminEntityChangedEvent {
  entityType: 'ROUTE' | 'TRIP' | 'BUS' | 'STOP' | string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | string;
  entityId: string;
}

export function useAdminEvents() {
  const queryClient = useQueryClient();
  const { client, isConnected } = useTrackingConnection(true);

  useEffect(() => {
    if (!isConnected || !client) return;

    console.log('[ADMIN_EVENTS] Subscribing to /topic/admin...');
    const subscription = client.subscribe('/topic/admin', (message) => {
      try {
        const event: AdminEntityChangedEvent = JSON.parse(message.body);
        console.log('[ADMIN_EVENTS] Received update:', event);

        // Map entity type to react-query query keys
        switch (event.entityType) {
          case 'ROUTE':
            queryClient.invalidateQueries({ queryKey: ['routes'] });
            queryClient.invalidateQueries({ queryKey: ['route', event.entityId] });
            break;
          case 'TRIP':
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            queryClient.invalidateQueries({ queryKey: ['driver-trips'] });
            queryClient.invalidateQueries({ queryKey: ['trip', event.entityId] });
            break;
          case 'BUS':
            queryClient.invalidateQueries({ queryKey: ['buses'] });
            queryClient.invalidateQueries({ queryKey: ['bus', event.entityId] });
            break;
          case 'STOP':
            queryClient.invalidateQueries({ queryKey: ['stops'] });
            queryClient.invalidateQueries({ queryKey: ['stop', event.entityId] });
            break;
          default:
            console.warn('[ADMIN_EVENTS] Unknown entity type:', event.entityType);
        }

        // Optional: show a small toast notification for other admins
        // if (event.action === 'CREATED' || event.action === 'UPDATED') {
        //   toast.info(`Datos actualizados (${event.entityType})`, {
        //     description: 'Los cambios de otro administrador se han sincronizado.',
        //     position: 'bottom-right',
        //   });
        // }
      } catch (error) {
        console.error('[ADMIN_EVENTS] Failed to parse admin event:', error);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, queryClient]);
}
