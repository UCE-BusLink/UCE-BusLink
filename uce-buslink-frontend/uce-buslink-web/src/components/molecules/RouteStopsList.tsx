import { StopRow } from './StopRow';
import type { RouteStopDetail } from '../../types';

interface RouteStopsListProps {
  stops: RouteStopDetail[];
}

export function RouteStopsList({ stops }: RouteStopsListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-navy-900">Paradas de la ruta</h2>
        <span className="text-xs text-gray-400">{stops.length} paradas</span>
      </div>
      <div>
        {stops.map((stop, i) => (
          <StopRow
            key={`${stop.order}-${stop.name}`}
            stop={stop}
            isLast={i === stops.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
