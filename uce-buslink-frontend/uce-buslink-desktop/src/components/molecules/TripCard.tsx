import { Clock, MapPin, User as UserIcon, Armchair, Users } from 'lucide-react';
import { StatBadge } from '../atoms';
import type { Trip, Route } from '../../types';

interface TripCardProps {
  trip: Trip;
  route: Route;
  onSelect: () => void;
}

export function TripCard({ trip, route, onSelect }: TripCardProps) {
  const hasSpace = trip.availableSeats + trip.standingSpots > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-navy-900 leading-tight">{route.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={13} className="text-gray-400" />
            {route.destination}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-navy-900 font-bold">
            <Clock size={15} className="text-amber-500" />
            {trip.time}
          </div>
          <span className="text-xs text-gray-400 mt-1">hrs</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <UserIcon size={14} className="text-gray-400" />
        {trip.driver}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <StatBadge icon={<Armchair size={13} />} value={trip.availableSeats} label="asientos" tone="green" />
        <StatBadge icon={<Users size={13} />} value={trip.standingSpots} label="de pie" tone="amber" />
      </div>

      <button
        onClick={onSelect}
        disabled={!hasSpace}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors mt-auto ${
          hasSpace
            ? 'bg-navy-900 text-white hover:bg-navy-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {hasSpace ? 'Seleccionar lugar' : 'Sin cupos'}
      </button>
    </div>
  );
}
