import { useNavigate } from 'react-router-dom';
import { CalendarOff } from 'lucide-react';
import { useDriverTrips } from '../../hooks/useDriverTrips';
import { DriverTripCard } from '../../components/molecules';
import { Spinner } from '../../components/atoms';

export function DriverDashboardPage() {
  const navigate = useNavigate();
  const { trips, loading, error } = useDriverTrips();

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Mis viajes</h1>
        <p className="text-gray-500 text-sm mt-1">Viajes asignados para hoy.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarOff size={24} className="opacity-40" />
          </div>
          <p className="font-semibold text-gray-500 mb-1">Sin viajes asignados hoy</p>
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
