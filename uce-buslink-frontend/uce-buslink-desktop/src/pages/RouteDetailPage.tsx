import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { getCurrentWeekDays } from '../data/mockData';
import { useRoute } from '../hooks/useRoute';
import { useTripsByRoute } from '../hooks/useTripsByRoute';
import type { RouteStopDetail, StopType, ApiTrip } from '../types';
import {
  EmptyState,
  RouteDetailHeader,
  WeekDayPicker,
  DepartureTimesList,
  RouteStopsList,
  RouteInfoCard,
} from '../components/molecules';

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');

  const weekDays = getCurrentWeekDays();
  const todayIndex = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex >= 0 ? todayIndex : 0);

  // HU-244 — favorito local (persistencia pendiente del backend de favoritos)
  const [isFavorite, setIsFavorite] = useState(false);

  const { route, loading, error, notFound } = useRoute(routeId);
  const { trips, loading: tripsLoading, error: tripsError } = useTripsByRoute(isAdminContext ? undefined : routeId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-6" />
        <div className="h-20 bg-gray-100 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-40 bg-gray-100 rounded-2xl" />
          <div className="h-56 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !route) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Ruta no encontrada.</p>
        <button
          onClick={() => navigate('/routes')}
          className="text-sm text-navy-900 font-semibold hover:underline"
        >
          Volver a rutas
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={28} className="text-red-400" />}
        iconBg="bg-red-50"
        title="No se pudo cargar la ruta"
        description={error}
      />
    );
  }

  const stops: RouteStopDetail[] = (route.stops ?? [])
    .sort((a, b) => a.stopOrder - b.stopOrder)
    .map((s, i, arr) => ({
      order: s.stopOrder,
      name: s.stopName,
      type: (i === 0 ? 'origin' : i === arr.length - 1 ? 'destination' : 'stop') as StopType,
      lat: s.latitude,
      lng: s.longitude,
    }));

  function handleSelectTrip(trip: ApiTrip) {
    navigate(`/routes/${routeId}/seats/${trip.id}`);
  }

  return (
    <div>
      <RouteDetailHeader
        backLabel={isAdminContext ? 'Gestión de rutas' : 'Rutas disponibles'}
        onBack={() => navigate(isAdminContext ? '/admin/routes' : '/routes')}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((v) => !v)}
        onViewMap={() => navigate('/map')}
      />

      <WeekDayPicker
        days={weekDays}
        selectedIndex={selectedDayIndex}
        onSelect={setSelectedDayIndex}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <DepartureTimesList
            trips={trips}
            loading={tripsLoading}
            error={tripsError}
            onSelect={isAdminContext ? undefined : handleSelectTrip}
          />
          <RouteStopsList stops={stops} />
        </div>
        <RouteInfoCard
          name={route.name}
          isActive={route.isActive}
          estimatedDurationMinutes={route.estimatedDurationMinutes}
          description={route.description}
          stopsCount={stops.length}
          departuresCount={trips.length}
        />
      </div>
    </div>
  );
}
