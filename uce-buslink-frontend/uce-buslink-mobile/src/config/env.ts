export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const CLERK_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  'pk_test_c21hc2hpbmctdGVybWl0ZS0xOS5jbGVyay5hY2NvdW50cy5kZXYk';

const EXPLICIT_WS_URL = process.env.EXPO_PUBLIC_WS_URL;

export function resolveTrackingWsUrl(): string {
  if (EXPLICIT_WS_URL) return EXPLICIT_WS_URL;
  if (API_URL) {
    return `${API_URL.replace(/^http/, 'ws').replace(/\/+$/, '')}/ws/tracking`;
  }
  return 'ws://10.0.2.2:8080/ws/tracking';
}

export const TRACKING_WS_URL = resolveTrackingWsUrl();

export const CLERK_JWT_TEMPLATE = 'uce-buslink';
