import type { Route, Trip, Seat, StandingSpot, WeekDay } from '../types';

export const routes: Route[] = [
  {
    id: 'norte',
    name: 'Ruta Norte',
    destination: 'Carcelén',
    stops: [
      { name: 'Campus Central', type: 'origin' },
      { name: 'Seminario Mayor', type: 'stop' },
      { name: 'Colón', type: 'stop' },
      { name: 'El Labrador', type: 'stop' },
      { name: 'Carcelén', type: 'destination' },
    ],
    departureTimes: ['19:00', '20:00', '21:00'],
    availableSeats: 15,
    standingSpots: 10,
    distanceKm: 12.5,
    direction: 'north',
  },
  {
    id: 'sur',
    name: 'Ruta Sur',
    destination: 'Quitumbe',
    stops: [
      { name: 'Campus Central', type: 'origin' },
      { name: 'El Recreo', type: 'stop' },
      { name: 'Solanda', type: 'stop' },
      { name: 'Terminal Quitumbe', type: 'destination' },
    ],
    departureTimes: ['19:30', '20:30', '21:45'],
    availableSeats: 8,
    standingSpots: 20,
    distanceKm: 10.2,
    direction: 'south',
  },
  {
    id: 'valle',
    name: 'Ruta Valle',
    destination: 'Tumbaco',
    stops: [
      { name: 'Campus Central', type: 'origin' },
      { name: 'La Armenia', type: 'stop' },
      { name: 'Parque Central Tumbaco', type: 'destination' },
    ],
    departureTimes: ['18:30', '20:15'],
    availableSeats: 0,
    standingSpots: 5,
    distanceKm: 15.8,
    direction: 'valley',
  },
];

export const trips: Trip[] = [
  {
    id: 't1',
    routeId: 'norte',
    time: '20:30',
    driver: 'Carlos Ruiz',
    availableSeats: 5,
    standingSpots: 10,
    status: 'confirmed',
  },
  {
    id: 't2',
    routeId: 'norte',
    time: '21:00',
    driver: 'Ana Lopez',
    availableSeats: 0,
    standingSpots: 12,
    status: 'confirmed',
  },
  {
    id: 't3',
    routeId: 'norte',
    time: '21:45',
    driver: 'Luis Gomez',
    availableSeats: 0,
    standingSpots: 0,
    status: 'unavailable',
  },
  {
    id: 't4',
    routeId: 'sur',
    time: '19:30',
    driver: 'María Torres',
    availableSeats: 8,
    standingSpots: 5,
    status: 'confirmed',
  },
  {
    id: 't5',
    routeId: 'sur',
    time: '20:30',
    driver: 'Pedro Vega',
    availableSeats: 3,
    standingSpots: 20,
    status: 'confirmed',
  },
  {
    id: 't6',
    routeId: 'sur',
    time: '21:45',
    driver: 'Rosa Méndez',
    availableSeats: 0,
    standingSpots: 0,
    status: 'unavailable',
  },
  {
    id: 't7',
    routeId: 'valle',
    time: '18:30',
    driver: 'Jorge Salinas',
    availableSeats: 0,
    standingSpots: 5,
    status: 'confirmed',
  },
  {
    id: 't8',
    routeId: 'valle',
    time: '20:15',
    driver: 'Carla Núñez',
    availableSeats: 0,
    standingSpots: 0,
    status: 'unavailable',
  },
];

export const initialSeats: Seat[] = [
  { number: 1, status: 'available' },
  { number: 2, status: 'occupied' },
  { number: 3, status: 'available' },
  { number: 4, status: 'unavailable' as const },
  { number: 5, status: 'available' },
  { number: 6, status: 'available' },
  { number: 7, status: 'occupied' },
  { number: 8, status: 'available' },
  { number: 9, status: 'available' },
  { number: 10, status: 'available' },
  { number: 11, status: 'unavailable' as const },
  { number: 12, status: 'available' },
];

export const initialStandingSpots: StandingSpot[] = Array.from(
  { length: 10 },
  (_, i) => ({ id: i + 1, available: i >= 3 })
);

export const upcomingReservation = {
  routeName: 'Ruta Norte',
  destination: 'Carcelén',
  time: '20:30',
  seat: 'Asiento 12',
  driver: 'Carlos Ruiz',
  unit: 'PBC-1234',
  date: 'Hoy, Jue 21 May',
};

export const mockUser = {
  name: 'Juan',
  lastName: 'Pérez',
  initials: 'JP',
  email: 'jperez@uce.edu.ec',
  universityId: 'UCE-2021-0458',
  trustScore: 98,
  totalTrips: 45,
  punctualityRate: 100,
};

export function getCurrentWeekDays(): WeekDay[] {
  const LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);

  return LABELS.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      label,
      day: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

export function getRouteById(id: string): Route | undefined {
  return routes.find((r) => r.id === id);
}

export function getTripsByRoute(routeId: string): Trip[] {
  return trips.filter((t) => t.routeId === routeId);
}

export function getTripById(id: string): Trip | undefined {
  return trips.find((t) => t.id === id);
}
