import { useNavigate } from 'react-router-dom';
import { CalendarOff, RefreshCw } from 'lucide-react';
import { useDriverTrips } from '../../hooks/useDriverTrips';
import { DriverTripCard } from '../../components/molecules';
import { Spinner } from '../../components/atoms';

export function DriverDashboardPage() {
  const navigate = useNavigate();
  const { trips, loading, error, refetch } = useDriverTrips();

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Mis viajes</h1>
          <p className="text-gray-500 text-sm mt-1">Selecciona un viaje para escanear pasajeros.</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Recargar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-100 p-6 text-center">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarOff size={24} className="opacity-40" />
          </div>
          <p className="font-semibold text-gray-500 mb-1">Sin viajes asignados</p>
          <p className="text-sm">Cuando el administrador te asigne un viaje aparecerá aquí.</p>
        </div>
      ) : (
        <div>
          {trips.map((trip) => (
            <DriverTripCard
              key={trip.id}
              trip={trip}
              onClick={() => navigate(`/driver/trips/${trip.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
