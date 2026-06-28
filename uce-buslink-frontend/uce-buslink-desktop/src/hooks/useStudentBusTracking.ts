import { useEffect, useState } from 'react';
import { useTrackingConnection } from './useTrackingConnection';
import type { LiveBusLocation } from '../types';

interface StudentBusTracking {
  location: LiveBusLocation | null;
  isConnected: boolean;
}

export function useStudentBusTracking(tripId: string | null): StudentBusTracking {
  const { client, isConnected } = useTrackingConnection(!!tripId);
  const [location, setLocation] = useState<LiveBusLocation | null>(null);

  useEffect(() => {
    return () => setLocation(null);
  }, [tripId]);

  useEffect(() => {
    if (!client || !isConnected || !tripId) return;

    const subscription = client.subscribe(
      `/topic/trip/${tripId}/location-update`,
      (message) => {
        if (message.body) {
          setLocation(JSON.parse(message.body) as LiveBusLocation);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [client, isConnected, tripId]);

  return { location, isConnected };
}
