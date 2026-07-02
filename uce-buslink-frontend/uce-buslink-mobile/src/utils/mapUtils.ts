import type { StopType } from '../types';

export const UCE_CENTER = { latitude: -0.2298, longitude: -78.5249 };

export function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

export function deriveStopType(index: number, total: number): StopType {
  if (index === 0) return 'origin';
  if (index === total - 1) return 'destination';
  return 'stop';
}

export const STOP_COLORS: Record<StopType, string> = {
  origin: '#22c55e',
  stop: '#1e3a5f',
  destination: '#f59e0b',
};

export function stopColor(type: StopType): string {
  return STOP_COLORS[type];
}
