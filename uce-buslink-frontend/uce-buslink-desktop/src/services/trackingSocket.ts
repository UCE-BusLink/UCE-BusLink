const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';
const EXPLICIT_WS_URL = import.meta.env.VITE_WS_URL as string | undefined;

function resolveTrackingWsUrl(): string {
  if (EXPLICIT_WS_URL) return EXPLICIT_WS_URL;
  if (API_URL) {
    return `${API_URL.replace(/^http/, 'ws').replace(/\/+$/, '')}/ws/tracking`;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.hostname}:8080/ws/tracking`;
}

export const TRACKING_WS_URL = resolveTrackingWsUrl();
