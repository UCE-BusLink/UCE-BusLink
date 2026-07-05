import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOff, RefreshCw, Filter } from 'lucide-react';
import { useDriverTrips } from '../../hooks/useDriverTrips';
import { DriverTripCard } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import type { DriverTripView } from '../../types';

type FilterState = 'ALL' | 'PENDING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export function DriverDashboardPage() {
  const navigate = useNavigate();
  const { trips, loading, error, refetch } = useDriverTrips();
  const [filter, setFilter] = useState<FilterState>('ALL');

  // Removed auto-cancel logic (now handled by backend scheduled job)

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      if (filter === 'ALL') return true;
      if (filter === 'PENDING') return trip.state === 'SCHEDULED' || trip.state === 'ONGOING';
      if (filter === 'ONGOING') return trip.state === 'ONGOING';
      if (filter === 'COMPLETED') return trip.state === 'COMPLETED';
      if (filter === 'CANCELLED') return trip.state === 'CANCELLED';
      return true;
    });
  }, [trips, filter]);

  const groupedTrips = useMemo(() => {
    const groups: Record<string, DriverTripView[]> = {};

    filteredTrips.forEach(trip => {
      const date = new Date(trip.departureTime);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      let dateLabel = '';
      if (date.toDateString() === today.toDateString()) {
        dateLabel = 'Hoy, ' + date.toLocaleDateString('es-EC', { day: 'numeric', month: 'long' });
      } else if (date.toDateString() === tomorrow.toDateString()) {
        dateLabel = 'Mañana, ' + date.toLocaleDateString('es-EC', { day: 'numeric', month: 'long' });
      } else {
        dateLabel = date.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
        dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(trip);
    });

    return groups;
  }, [filteredTrips]);

  const FilterButton = ({ state, label }: { state: FilterState, label: string }) => (
    <button
      onClick={() => setFilter(state)}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${filter === state ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight">Mis viajes</h1>
          <p className="text-gray-500 text-sm mt-1">Selecciona un viaje para ver detalles y pasajeros.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <div className="bg-white rounded-xl border border-gray-200 p-1 flex items-center shadow-sm shrink-0">
            <FilterButton state="ALL" label="Todos" />
            <FilterButton state="PENDING" label="Pendientes" />
            <FilterButton state="ONGOING" label="En curso" />
            <FilterButton state="COMPLETED" label="Completados" />
            <FilterButton state="CANCELLED" label="Cancelados" />
          </div>
          <button
            onClick={refetch}
            className="flex items-center justify-center p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors shadow-sm shrink-0"
            title="Recargar viajes"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-100 p-8 text-center shadow-sm">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-6 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarOff size={32} className="opacity-40" />
          </div>
          <p className="text-xl font-bold text-navy-900 mb-2">Sin viajes asignados</p>
          <p className="text-gray-500">Cuando el administrador te asigne un viaje aparecerá aquí.</p>
        </div>
      ) : Object.keys(groupedTrips).length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter size={32} className="opacity-40" />
          </div>
          <p className="text-xl font-bold text-navy-900 mb-2">No hay viajes con este filtro</p>
          <p className="text-gray-500">Intenta cambiar el filtro para ver tus otros viajes.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTrips).map(([dateLabel, tripsInDate]) => (
            <div key={dateLabel} className="animate-fade-in">
              <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                {dateLabel}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tripsInDate.map((trip) => (
                  <DriverTripCard
                    key={trip.id}
                    trip={trip}
                    onClick={() => navigate(`/driver/trips/${trip.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
