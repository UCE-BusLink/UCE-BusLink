import { Bus, Clock, Flag, Armchair } from 'lucide-react';
import type { DriverTripDetailView } from '../../types';

const STATE_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const STATE_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

interface TripSummaryCardProps {
  trip: DriverTripDetailView;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

export function TripSummaryCard({ trip }: TripSummaryCardProps) {
  const stateStyle = STATE_STYLES[trip.state] ?? 'bg-gray-100 text-gray-600';
  const stateLabel = STATE_LABELS[trip.state] ?? trip.state;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bus size={18} className="text-navy-700" />
          </div>
          <div>
            <h2 className="font-semibold text-navy-900">{trip.routeName}</h2>
            <p className="text-xs text-gray-500 capitalize">{formatDate(trip.departureTime)}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${stateStyle}`}>
          {stateLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-3">
          <Clock size={15} className="text-navy-500" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Salida</span>
          <span className="text-sm font-semibold text-navy-900">{formatTime(trip.departureTime)}</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-3">
          <Flag size={15} className="text-navy-500" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Llegada</span>
          <span className="text-sm font-semibold text-navy-900">{formatTime(trip.estimatedArrivalTime)}</span>
        </div>
        <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl py-3">
          <Armchair size={15} className="text-navy-500" />
          <span className="text-[10px] text-gray-400 uppercase tracking-wide">Libres</span>
          <span className="text-sm font-semibold text-navy-900">{trip.availableSeats}</span>
        </div>
      </div>
    </div>
  );
}
