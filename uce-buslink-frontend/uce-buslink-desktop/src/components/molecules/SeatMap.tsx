import { Bus } from 'lucide-react';
import { SeatButton, LegendItem } from '../atoms';
import type { Seat, StandingSpot } from '../../types';

interface SeatMapProps {
  seats: Seat[];
  standingSpots: StandingSpot[];
  selectedStandingId: number | null;
  onSelectSeat: (seatNumber: number) => void;
  onSelectStanding: (spotId: number) => void;
}

export function SeatMap({
  seats,
  standingSpots,
  selectedStandingId,
  onSelectSeat,
  onSelectStanding,
}: SeatMapProps) {
  const leftSeats = seats.filter((s) => [1, 2, 5, 6, 9, 10].includes(s.number));
  const rightSeats = seats.filter((s) => [3, 4, 7, 8, 11, 12].includes(s.number));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-navy-900 mb-6">Mapa de Asientos</h2>

      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute -top-1 right-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Bus size={14} className="text-gray-500" />
          </div>
          <div className="flex gap-8 bg-gray-50 rounded-xl p-6 mt-2">
            <div className="grid grid-cols-2 gap-2">
              {leftSeats.map((seat) => (
                <SeatButton key={seat.number} seat={seat} onSelect={() => onSelectSeat(seat.number)} />
              ))}
            </div>
            <div className="w-px bg-gray-200 self-stretch" />
            <div className="grid grid-cols-2 gap-2">
              {rightSeats.map((seat) => (
                <SeatButton key={seat.number} seat={seat} onSelect={() => onSelectSeat(seat.number)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-navy-900 mb-0.5">
          Zona de pie – {standingSpots.length * 3} lugares
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Asientos ocupados – puedes reservar un lugar de pie
        </p>
        <div className="flex gap-2 flex-wrap">
          {standingSpots.map((spot) => (
            <button
              key={spot.id}
              onClick={spot.available ? () => onSelectStanding(spot.id) : undefined}
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
        <LegendItem color="bg-amber-400" label="Lugar de pie disponible" />
      </div>
    </div>
  );
}
