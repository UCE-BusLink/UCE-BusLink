import { Clock, Armchair } from 'lucide-react';
import type { ApiTrip } from '../../types';
import { Spinner } from '../atoms';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

interface DepartureTimesListProps {
  trips: ApiTrip[];
  loading: boolean;
  error?: string | null;
  onSelect?: (trip: ApiTrip) => void;
}

export function DepartureTimesList({ trips, loading, error, onSelect }: DepartureTimesListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-navy-900 mb-4">Próximas salidas</h2>

      {loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : trips.length === 0 ? (
        <p className="text-sm text-gray-400">No hay salidas programadas para esta fecha.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {trips.map((trip) => {
            const hasSpace = trip.availableSeats > 0;
            return (
              <div key={trip.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <Clock size={14} className="text-amber-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-navy-900">
                    {formatTime(trip.departureTime)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Armchair size={12} />
                    {trip.availableSeats}
                  </span>
                  {onSelect && (
                    <button
                      onClick={() => hasSpace && onSelect(trip)}
                      disabled={!hasSpace}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        hasSpace
                          ? 'bg-navy-900 text-white hover:bg-navy-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {hasSpace ? 'Seleccionar lugar' : 'Sin cupos'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
