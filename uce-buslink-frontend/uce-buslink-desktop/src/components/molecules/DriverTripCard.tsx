import { Clock, Armchair, ChevronRight } from 'lucide-react';
import type { DriverTripView } from '../../types';

const STATE_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ONGOING: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const STATE_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  ONGOING: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

interface DriverTripCardProps {
  trip: DriverTripView;
  onClick: () => void;
}

export function DriverTripCard({ trip, onClick }: DriverTripCardProps) {
  const stateStyle = STATE_STYLES[trip.state] ?? 'bg-gray-100 text-gray-600';
  const stateLabel = STATE_LABELS[trip.state] ?? trip.state;
  const date = new Date(trip.departureTime);
  const time = date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const day = date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-3 hover:border-navy-900/30 hover:shadow-md transition-all flex items-center gap-4"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-navy-900 text-sm truncate">{trip.routeName}</h3>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${stateStyle}`}>
            {stateLabel}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {day} · {time}
          </span>
          <span className="flex items-center gap-1">
            <Armchair size={12} />
            {trip.availableSeats} libres
          </span>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
    </button>
  );
}
