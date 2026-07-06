export interface ApiRouteStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedMinutesFromStart: number | null;
}

export interface ApiRoute {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  estimatedDurationMinutes: number | null;
  pathPolyline: string | null;
  stops: ApiRouteStop[] | null;
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

export interface RouteStopDetail {
  order: number;
  name: string;
  type: StopType;
  lat: number;
  lng: number;
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
  hasTrips?: boolean;
  dateString?: string;
}

export type SeatState = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'BLOCKED';

export interface ApiSeat {
  id: string;
  tripId: string;
  seatNumber: number;
  state: SeatState;
}

export interface ApiTrip {
  id: string;
  routeId: string;
  busId: string;
  driverId: string;
  state: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
}

export interface ApiReservation {
  id: string;
  tripId: string;
  seatId: string;
  status: string;
  qrCode: string;
}

export interface ActiveReservationItem {
  reservation: ApiReservation;
  trip: ApiTrip;
  route: ApiRoute;
  driverName?: string;
}

export interface DriverTripView {
  id: string;
  routeId: string;
  routeName: string;
  state: string;
  departureTime: string;
  availableSeats: number;
}

export interface DriverTripDetailView {
  id: string;
  busId: string;
  routeId: string;
  routeName: string;
  state: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
}

export type TripState = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface LiveBusLocation {
  busId: string;
  tripId: string;
  latitude: number;
  longitude: number;
  velocity: number;
  etaMinutes: number;
  nextStopName: string;
}

export interface DriverPassengerResponse {
  reservationId: string;
  tripId: string;
  seatId: string;
  status: string;
  boardingStopId: string;
  studentName: string;
}
