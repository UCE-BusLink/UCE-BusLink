import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Client } from '@stomp/stompjs';

export interface DriverPosition {
  latitude: number;
  longitude: number;
  velocity: number;
}

export function useDriverLocationPublisher(
  client: Client | null,
  isConnected: boolean,
  busId: string | null,
  active: boolean
): DriverPosition | null {
  const [position, setPosition] = useState<DriverPosition | null>(null);

  useEffect(() => {
    if (!active || !client || !isConnected || !busId) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('[TRACKING] Permiso de ubicación denegado.');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        (pos) => {
          if (cancelled || !client) return;
          const speed = pos.coords.speed;
          const velocity = speed != null && speed >= 0 ? speed * 3.6 : 0;

          client.publish({
            destination: '/app/gps.update',
            body: JSON.stringify({
              busId,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              velocity,
              timestamp: pos.timestamp,
            }),
          });

          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            velocity,
          });
        }
      );
    }

    start();

    return () => {
      cancelled = true;
      subscription?.remove();
      setPosition(null);
    };
  }, [client, isConnected, busId, active]);

  return position;
}
