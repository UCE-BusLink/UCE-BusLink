import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Client } from '@stomp/stompjs';
import { TRACKING_WS_URL } from '../services/trackingSocket';

interface TrackingConnection {
  client: Client | null;
  isConnected: boolean;
}

export function useTrackingConnection(enabled: boolean = true): TrackingConnection {
  const { getToken } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let stompClient: Client | null = null;

    async function connect() {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token || !active) return;

      stompClient = new Client({
        brokerURL: TRACKING_WS_URL,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          if (active) setIsConnected(true);
        },
        onWebSocketClose: () => {
          if (active) setIsConnected(false);
        },
        onStompError: (frame) => {
          console.error('[TRACKING] Error STOMP:', frame.headers['message'], frame.body);
        },
      });

      stompClient.activate();
      if (active) setClient(stompClient);
    }

    connect();

    return () => {
      active = false;
      setIsConnected(false);
      setClient(null);
      stompClient?.deactivate();
    };
  }, [enabled, getToken]);

  return { client, isConnected };
}
