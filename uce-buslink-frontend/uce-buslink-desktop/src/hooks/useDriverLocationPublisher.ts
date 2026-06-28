import { useEffect, useState } from 'react';
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

    if (!('geolocation' in navigator)) {
      console.error('[TRACKING] La geolocalización no está disponible en este navegador.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
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
      },
      (error) => {
        console.error('[TRACKING] Error de geolocalización:', error.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setPosition(null);
    };
  }, [client, isConnected, busId, active]);

  return position;
}
