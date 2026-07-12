import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Clock, Armchair, Bus, User } from 'lucide-react';
import type { ApiTrip } from '../../types';
import { Spinner } from '../atoms';
import { fetchBusById, fetchBasicUserInfo } from '../../services/tripService';

function getTimeOfDay(iso: string): string {
  const hour = new Date(iso).getHours();
  if (hour < 12) return 'En la mañana';
  if (hour < 19) return 'En la tarde';
  return 'En la noche';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function DepartureTimeItem({ trip, onSelect }: { trip: ApiTrip; onSelect?: (trip: ApiTrip) => void }) {
  const { getToken } = useAuth();
  const [bus, setBus] = useState<{ plateNumber: string; internalCode: string } | null>(null);
  const [driver, setDriver] = useState<{ firstName: string; lastName: string } | null>(null);
  const [loadingBus, setLoadingBus] = useState(false);
  const [loadingDriver, setLoadingDriver] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) return;

        if (trip.busId) {
          setLoadingBus(true);
          fetchBusById(token, trip.busId)
            .then(data => { if (!cancelled) setBus(data); })
            .catch(err => console.error('Error fetching bus', err))
            .finally(() => { if (!cancelled) setLoadingBus(false); });
        }

        if (trip.driverId) {
          setLoadingDriver(true);
          fetchBasicUserInfo(token, trip.driverId)
            .then(data => { if (!cancelled) setDriver(data); })
            .catch(err => console.error('Error fetching driver', err))
            .finally(() => { if (!cancelled) setLoadingDriver(false); });
        }
      } catch (err) {
        console.error('Error loading trip details', err);
      }
    }
    loadDetails();
    return () => { cancelled = true; };
  }, [trip.busId, trip.driverId, getToken]);

  const hasSpace = trip.availableSeats > 0;
  const timeOfDay = getTimeOfDay(trip.departureTime);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-50 last:border-0 gap-4">
      <div className="flex items-start gap-4 flex-1">
        <div className="bg-amber-50 p-3 rounded-xl flex flex-col items-center justify-center min-w-[70px]">
          <span className="text-amber-600 text-xs font-bold uppercase">{timeOfDay}</span>
          <span className="text-lg font-bold text-amber-600 mt-1">{formatTime(trip.departureTime)}</span>
        </div>

        <div className="flex flex-col gap-1.5 justify-center flex-1">
          <div className="flex items-center gap-1.5 text-navy-900 text-sm font-medium">
            <User size={14} className="text-gray-400" />
            {loadingDriver ? (
              <span className="animate-pulse bg-gray-200 h-4 w-24 rounded"></span>
            ) : driver ? (
              <span>{driver.firstName} {driver.lastName}</span>
            ) : (
              <span className="text-gray-400 italic">Conductor por confirmar</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Bus size={14} className="text-gray-400" />
            {loadingBus ? (
              <span className="animate-pulse bg-gray-200 h-3 w-16 rounded"></span>
            ) : bus ? (
              <span>Unidad {bus.internalCode} • {bus.plateNumber}</span>
            ) : (
              <span className="text-gray-400 italic">Unidad por asignar</span>
            )}
          </div>
        </div>
      </div>

      {trip.state === 'TEMPLATE' ? (
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-semibold border border-gray-200">
            Plantilla Base
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
              <Armchair size={14} className={hasSpace ? "text-emerald-500" : "text-gray-400"} />
              <span className={hasSpace ? "text-navy-900 font-bold" : ""}>
                {trip.availableSeats}
              </span>
              <span>cupos</span>
            </span>
          </div>

          {onSelect && (
            <button
              onClick={() => hasSpace && onSelect(trip)}
              disabled={!hasSpace}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${hasSpace
                  ? 'bg-navy-900 text-white hover:bg-navy-800 hover:shadow-md active:scale-95'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
            >
              {hasSpace ? 'Reservar' : 'Agotado'}
            </button>
          )}
        </div>
      )}
    </div>
  );
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
      <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
        <Clock className="text-amber-500" />
        Salidas programadas
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-500 font-medium">No hay salidas programadas para este día.</p>
          <p className="text-xs text-gray-400 mt-1">Intenta seleccionando otra fecha en el calendario.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {trips.map((trip) => (
            <DepartureTimeItem key={trip.id} trip={trip} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}