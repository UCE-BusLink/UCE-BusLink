import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bus, Clock, User as UserIcon, ChevronLeft, Armchair } from 'lucide-react';
import {
  getRouteById,
  getTripById,
  initialSeats,
  initialStandingSpots,
} from '../data/mockData';
import type { Seat, SeatStatus } from '../types';

const SEAT_STYLES: Record<SeatStatus, string> = {
  available: 'bg-green-400 hover:bg-green-500 text-white cursor-pointer',
  occupied: 'bg-red-400 text-white cursor-not-allowed',
  selected: 'bg-navy-900 text-white cursor-pointer ring-2 ring-navy-700 ring-offset-1',
  unavailable: 'bg-gray-200 text-gray-400 cursor-not-allowed',
};

function SeatButton({ seat, onSelect }: { seat: Seat; onSelect: () => void }) {
  const isInteractive = seat.status === 'available' || seat.status === 'selected';
  return (
    <button
      onClick={isInteractive ? onSelect : undefined}
      disabled={!isInteractive}
      className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${SEAT_STYLES[seat.status]}`}
    >
      {seat.number}
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-navy-900">{value}</p>
      </div>
    </div>
  );
}

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

  const allSeatsUnavailable = seats.every(
    (s) => s.status === 'occupied' || s.status === 'unavailable'
  );
  const allStandingUnavailable = standingSpots.every((s) => !s.available);
  const noSpaceAvailable = allSeatsUnavailable && allStandingUnavailable;

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

  const leftColumnSeats = seats.filter((s) => [1, 2, 5, 6, 9, 10].includes(s.number));
  const rightColumnSeats = seats.filter((s) => [3, 4, 7, 8, 11, 12].includes(s.number));

  const selectionLabel = selectedSeat
    ? `Asiento ${selectedSeat.number}`
    : selectedStandingId
    ? `Lugar de pie`
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
        Seleccionar lugar - {route.name} ({trip.time})
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        Elige un asiento o un lugar de pie para tu viaje
      </p>

      {noSpaceAvailable ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Armchair size={28} className="text-red-400" />
          </div>
          <p className="font-semibold text-gray-800 mb-1">Sin lugares disponibles</p>
          <p className="text-sm text-gray-400 mb-6">
            Todos los asientos y lugares de pie para este viaje estan ocupados.
          </p>
          <button
            onClick={() => navigate(`/routes/${routeId}`)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
          >
            Ver otros horarios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-navy-900 mb-6">Mapa de Asientos</h2>

              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -top-1 right-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Bus size={14} className="text-gray-500" />
                  </div>
                  <div className="flex gap-8 bg-gray-50 rounded-xl p-6 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {leftColumnSeats.map((seat) => (
                        <SeatButton
                          key={seat.number}
                          seat={seat}
                          onSelect={() => selectSeat(seat.number)}
                        />
                      ))}
                    </div>
                    <div className="w-px bg-gray-200 self-stretch" />
                    <div className="grid grid-cols-2 gap-2">
                      {rightColumnSeats.map((seat) => (
                        <SeatButton
                          key={seat.number}
                          seat={seat}
                          onSelect={() => selectSeat(seat.number)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-navy-900 mb-0.5">
                  Zona de pie - {standingSpots.filter((s) => s.available).length} lugares
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Puedes reservar un lugar de pie si no hay asientos disponibles
                </p>
                <div className="flex gap-2 flex-wrap">
                  {standingSpots.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={spot.available ? () => selectStanding(spot.id) : undefined}
                      disabled={!spot.available}
                      className={`w-8 h-8 rounded-full transition-all ${
                        !spot.available
                          ? 'bg-gray-200 cursor-not-allowed'
                          : selectedStandingId === spot.id
                          ? 'bg-navy-900 ring-2 ring-navy-700 ring-offset-1'
                          : 'bg-amber-400 hover:bg-amber-500 cursor-pointer'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6 pt-5 border-t border-gray-100 flex-wrap">
                <LegendItem color="bg-green-400" label="Disponible" />
                <LegendItem color="bg-red-400" label="Ocupado" />
                <LegendItem color="bg-navy-900" label="Seleccionado" />
                <LegendItem color="bg-gray-200" label="No disponible" />
                <LegendItem color="bg-amber-400" label="De pie disponible" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
            <h2 className="text-sm font-semibold text-navy-900 mb-5">Resumen de Reserva</h2>

            <div className="space-y-4">
              <SummaryRow icon={<Bus size={14} />} label="Ruta" value={route.name} />
              <SummaryRow icon={<Clock size={14} />} label="Horario" value={`${trip.time} hrs`} />
              <SummaryRow icon={<UserIcon size={14} />} label="Conductor" value={trip.driver} />
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Tu seleccion</p>
              {selectionLabel ? (
                <p className="text-2xl font-bold text-navy-900">{selectionLabel}</p>
              ) : (
                <p className="text-sm text-gray-400">Ninguno seleccionado</p>
              )}
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              disabled={!hasSelection}
              className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                hasSelection
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirmar reserva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
