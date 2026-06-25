import { Clock, Users } from 'lucide-react';
import type { ApiDriverTrip } from '../../types';

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

interface DriverTripCardProps {
  trip: ApiDriverTrip;
  onClick: () => void;
}

export function DriverTripCard({ trip, onClick }: DriverTripCardProps) {
  const stateStyle = STATE_STYLES[trip.state] ?? 'bg-gray-100 text-gray-600';
  const stateLabel = STATE_LABELS[trip.state] ?? trip.state;
  const time = new Date(trip.departureTime).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-3 hover:border-navy-900/20 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-navy-900 text-sm">{trip.routeName}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${stateStyle}`}>
          {stateLabel}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {time}
        </span>
        <span className="flex items-center gap-1">
          <Users size={11} />
          {trip.reservationCount} reservas
        </span>
      </div>
    </button>
  );
}
