import { Navigation, Flag, MapPin, Clock, Bus } from 'lucide-react';
import type { ApiRouteStop, StopType } from '../../types';
import { deriveStopType } from '../../utils/mapUtils';

const DOT_CLASS: Record<StopType, string> = {
  origin: 'bg-green-500 ring-green-100',
  stop: 'bg-navy-700 ring-navy-100',
  destination: 'bg-amber-500 ring-amber-100',
};

function StopRow({ stop, type, isLast }: { stop: ApiRouteStop; type: StopType; isLast: boolean }) {
  const label = type === 'origin' ? 'Origen' : type === 'destination' ? 'Destino' : 'Parada';
  const Icon = type === 'origin' ? Navigation : type === 'destination' ? Flag : MapPin;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-4 ${DOT_CLASS[type]}`}>
          <Icon size={type === 'stop' ? 11 : 13} className="text-white" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>
      <div className={isLast ? '' : 'pb-6'}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-navy-900">{stop.stopName}</p>
        {stop.estimatedMinutesFromStart !== null && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            {stop.estimatedMinutesFromStart} min desde inicio
          </p>
        )}
      </div>
    </div>
  );
}

interface MapStopsSidebarProps {
  stops: ApiRouteStop[];
  loading: boolean;
  onViewTrips: () => void;
}

export function MapStopsSidebar({ stops, loading, onViewTrips }: MapStopsSidebarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-navy-900">Paradas de la ruta</h2>
        <span className="text-xs text-gray-400">{stops.length}</span>
      </div>

      {stops.length > 0 ? (
        <div>
          {stops.map((stop, i) => (
            <StopRow
              key={stop.stopId}
              stop={stop}
              type={deriveStopType(i, stops.length)}
              isLast={i === stops.length - 1}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">
          {loading ? 'Cargando paradas...' : 'Sin paradas registradas'}
        </p>
      )}

      <button
        onClick={onViewTrips}
        className="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors flex items-center justify-center gap-1.5"
      >
        <Bus size={15} />
        Ver viajes de esta ruta
      </button>
    </div>
  );
}
