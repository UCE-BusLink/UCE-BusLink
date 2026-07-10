import type { ApiRouteStop } from './index';

// Mirrors backend com.ucebuslink.shared.event.RouteBroadcastEvent / TripBroadcastEvent
export interface RouteBroadcastMessage {
  changeType: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'DELETED';
  routeId: string;
  name: string | null;
  description: string | null;
  isActive: boolean | null;
  estimatedDurationMinutes: number | null;
  pathPolyline: string | null;
  stops: ApiRouteStop[] | null;
}

export interface TripBroadcastMessage {
  changeType: 'CREATED' | 'UPDATED' | 'STATE_CHANGED' | 'CANCELLED';
  tripId: string;
  routeId: string;
  busId: string;
  driverId: string;
  state: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
}
