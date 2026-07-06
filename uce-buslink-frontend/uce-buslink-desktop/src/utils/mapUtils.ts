import L from 'leaflet';
import type { StopType } from '../types';

export const UCE_CENTER: [number, number] = [-0.2298, -78.5249];

export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export function deriveStopType(index: number, total: number): StopType {
  if (index === 0) return 'origin';
  if (index === total - 1) return 'destination';
  return 'stop';
}

export function makeStopIcon(type: StopType, isSelected?: boolean) {
  const colors: Record<StopType, string> = {
    origin: '#22c55e',
    stop: '#1e3a5f',
    destination: '#f59e0b',
  };
  const c = colors[type];
  if (isSelected) {
    return L.divIcon({
      className: '',
      html: `<div style="width:20px;height:20px;border-radius:50%;background:${c};border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.5),0 3px 6px rgba(0,0,0,0.4)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });
  }
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${c};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4),0 0 0 2px ${c}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}
