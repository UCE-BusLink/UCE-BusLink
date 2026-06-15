export interface ApiRoute {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  estimatedDurationMinutes: number | null;
  pathPolyline: string | null;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type SeatStatus = 'available' | 'occupied' | 'selected';
export type TripStatus = 'confirmed' | 'unavailable';
export type RouteDirection = 'north' | 'south' | 'valley';
export type StopType = 'origin' | 'stop' | 'destination';

export interface RouteStop {
  name: string;
  type: StopType;
}

export interface Route {
  id: string;
  name: string;
  destination: string;
  stops: RouteStop[];
  departureTimes: string[];
  availableSeats: number;
  standingSpots: number;
  distanceKm: number;
  direction: RouteDirection;
}

export interface Trip {
  id: string;
  routeId: string;
  time: string;
  driver: string;
  availableSeats: number;
  standingSpots: number;
  status: TripStatus;
}

export interface Seat {
  number: number;
  status: SeatStatus;
}

export interface StandingSpot {
  id: number;
  available: boolean;
}

export interface WeekDay {
  label: string;
  day: number;
  isToday: boolean;
}
