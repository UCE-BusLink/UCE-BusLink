import { useEffect, useState } from 'react';
import { useTrackingConnection } from './useTrackingConnection';
import { distanceToStopMeters, etaToStopMinutes } from '../wasm/geoWasm';
import type { LiveBusLocation } from '../types';

interface StudentBusTracking {
  location: LiveBusLocation | null;
  isConnected: boolean;
  stopDistanceMeters: number | null;
  stopEtaMinutes: number | null;
}

interface TargetStop {
  latitude: number;
  longitude: number;
}

export function useStudentBusTracking(
  tripId: string | null,
  targetStop?: TargetStop | null
): StudentBusTracking {
  const { client, isConnected } = useTrackingConnection(!!tripId);
  const [location, setLocation] = useState<LiveBusLocation | null>(null);
  const [stopDistanceMeters, setStopDistanceMeters] = useState<number | null>(null);
  const [stopEtaMinutes, setStopEtaMinutes] = useState<number | null>(null);

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

  useEffect(() => {
    if (!location || !targetStop) {
      setStopDistanceMeters(null);
      setStopEtaMinutes(null);
      return;
    }

    let cancelled = false;

    distanceToStopMeters(
      location.latitude,
      location.longitude,
      targetStop.latitude,
      targetStop.longitude
    ).then(async (distance) => {
      if (cancelled) return;
      setStopDistanceMeters(distance);
      const eta = await etaToStopMinutes(distance, location.velocity);
      if (!cancelled) setStopEtaMinutes(eta);
    });

    return () => {
      cancelled = true;
    };
  }, [location, targetStop]);

  return { location, isConnected, stopDistanceMeters, stopEtaMinutes };
}
