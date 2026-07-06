import { useState, useEffect, useMemo } from 'react';
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
  LeafletMap,
} from '../components/molecules';

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');

  const { route, loading, error, notFound } = useRoute(routeId);
  const { trips, loading: tripsLoading, error: tripsError } = useTripsByRoute(routeId);

  const [weekOffset, setWeekOffset] = useState<number>(0);

  const weekDays = useMemo(() => {
    return getCurrentWeekDays(weekOffset).map((day) => {
      const hasTrips = trips.some((t) => t.departureTime.startsWith(day.dateString!));
      return { ...day, hasTrips };
    });
  }, [trips, weekOffset]);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [hasInitializedDay, setHasInitializedDay] = useState(false);

  useEffect(() => {
    if (!tripsLoading && !hasInitializedDay) {
      const defaultSelectedIndex = weekDays.findIndex((d) => d.hasTrips);
      const todayIndex = weekDays.findIndex((d) => d.isToday);
      
      const initialIndex = defaultSelectedIndex >= 0 
        ? defaultSelectedIndex 
        : (todayIndex >= 0 ? todayIndex : 0);
        
      setSelectedDayIndex(initialIndex);
      setHasInitializedDay(true);
    }
  }, [tripsLoading, weekDays, hasInitializedDay]);

  // HU-244 — favorito local (persistencia pendiente del backend de favoritos)
  const [isFavorite, setIsFavorite] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-6" />
        <div className="h-20 bg-gray-100 rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-40 bg-gray-100 rounded-2xl" />
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

  const selectedDay = weekDays[selectedDayIndex] || weekDays[0];
  const filteredTrips = trips.filter((t) => t.departureTime.startsWith(selectedDay.dateString!));

  return (
    <div>
      <RouteDetailHeader
        backLabel={isAdminContext ? 'Gestión de rutas' : 'Rutas disponibles'}
        onBack={() => navigate(isAdminContext ? '/admin/routes' : '/routes')}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((v) => !v)}
        onViewMap={() => navigate('/map?routeId=' + routeId)}
      />

      <WeekDayPicker
        days={weekDays}
        selectedIndex={selectedDayIndex}
        onSelect={setSelectedDayIndex}
        weekOffset={weekOffset}
        onWeekChange={(offset) => {
          setWeekOffset(offset);
          setSelectedDayIndex(0);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DepartureTimesList
            trips={filteredTrips}
            loading={tripsLoading}
            error={tripsError}
            onSelect={isAdminContext ? undefined : handleSelectTrip}
          />
          <RouteStopsList stops={stops} />
        </div>
        <div className="space-y-6">
          <RouteInfoCard
            name={route.name}
            isActive={route.isActive}
            estimatedDurationMinutes={route.estimatedDurationMinutes}
            description={route.description}
            stopsCount={stops.length}
            departuresCount={trips.length}
          />
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-navy-900">Mapa de la Ruta</h3>
            </div>
            <div className="p-3">
              {/* Le pasamos un wrapper para aislar LeafletMap con pointer-events-none y evitar navegación si es necesario */}
              <div className="relative pointer-events-none">
                <LeafletMap
                  selectedRoute={route}
                  loading={false}
                  showLocateButton={false}
                />
                {/* Capa transparente para atrapar clicks y evitar interacción con el mapa */}
                <div className="absolute inset-0 z-[1000] cursor-default bg-transparent pointer-events-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
