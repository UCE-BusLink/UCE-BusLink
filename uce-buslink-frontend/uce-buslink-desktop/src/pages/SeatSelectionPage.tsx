import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  getRouteById,
  getTripById,
  initialSeats,
  initialStandingSpots,
} from '../data/mockData';
import type { Seat } from '../types';
import { SeatMap, BookingSummary } from '../components/molecules';

export function SeatSelectionPage() {
  const { routeId, tripId } = useParams<{ routeId: string; tripId: string }>();
  const navigate = useNavigate();

  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const standingSpots = initialStandingSpots;
  const [selectedStandingId, setSelectedStandingId] = useState<number | null>(null);

  const route = getRouteById(routeId ?? '');
  const trip = getTripById(tripId ?? '');
  const selectedSeat = seats.find((s) => s.status === 'selected') ?? null;
  const hasSelection = selectedSeat !== null || selectedStandingId !== null;

  function selectSeat(seatNumber: number) {
    setSelectedStandingId(null);
    setSeats((prev) =>
      prev.map((s) => {
        if (s.number === seatNumber) {
          return { ...s, status: s.status === 'selected' ? 'available' : 'selected' };
        }
        return s.status === 'selected' ? { ...s, status: 'available' } : s;
      })
    );
  }

  function selectStanding(spotId: number) {
    setSeats((prev) =>
      prev.map((s) => (s.status === 'selected' ? { ...s, status: 'available' } : s))
    );
    setSelectedStandingId((prev) => (prev === spotId ? null : spotId));
  }

  if (!route || !trip) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Viaje no encontrado.</p>
        <button
          onClick={() => navigate(`/routes/${routeId}`)}
          className="text-sm text-navy-900 font-semibold hover:underline"
        >
          Volver al detalle de ruta
        </button>
      </div>
    );
  }

  const selectionLabel = selectedSeat
    ? `Asiento ${selectedSeat.number}`
    : selectedStandingId
    ? 'Lugar de pie'
    : null;

  return (
    <div>
      <button
        onClick={() => navigate(`/routes/${routeId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors mb-5"
      >
        <ChevronLeft size={16} />
        Detalle de ruta
      </button>

      <h1 className="text-2xl font-bold text-navy-900 mb-1">
        Seleccionar lugar – {route.name} ({trip.time})
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Elige un asiento o un lugar de pie para tu viaje
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <SeatMap
            seats={seats}
            standingSpots={standingSpots}
            selectedStandingId={selectedStandingId}
            onSelectSeat={selectSeat}
            onSelectStanding={selectStanding}
          />
        </div>
        <BookingSummary
          route={route}
          trip={trip}
          selectionLabel={selectionLabel}
          hasSelection={hasSelection}
          onConfirm={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
}
