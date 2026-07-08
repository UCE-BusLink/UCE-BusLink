import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import { useRoute } from '../hooks/useRoute';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { useStudentBusTracking } from '../hooks/useStudentBusTracking';
import { RouteTabBar, LeafletMap, RouteMetaCards, MapStopsSidebar } from '../components/molecules';
import { useAppStore } from '../store/useAppStore';

export function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId');
  const routeIdParam = searchParams.get('routeId');
  const { routes, loading: routesLoading } = useRoutes();
  const [manualSelectedId, setSelectedId] = useState<string>('');
  const { items: reservations } = useActiveReservations(true);

  const paramRouteId = reservations.find((item) => item.trip.id === tripIdParam)?.trip.routeId;
  const ongoingRouteId = reservations.find((item) => item.trip.state === 'ONGOING')?.trip.routeId;
  const selectedId = manualSelectedId || routeIdParam || paramRouteId || ongoingRouteId || routes[0]?.id || '';
  const { route: selectedRoute, loading: routeLoading } = useRoute(selectedId);

  const routeReservations = reservations.filter((item) => item.trip.routeId === selectedId);
  const trackedTripId =
    (routeReservations.find((item) => item.trip.id === tripIdParam) ??
      routeReservations.find((item) => item.trip.state === 'ONGOING') ??
      routeReservations[0])?.trip.id ?? null;
  const { location: liveBus, isConnected } = useStudentBusTracking(trackedTripId);

  const setActiveTracking = useAppStore((state) => state.setActiveTracking);
  const clearActiveTracking = useAppStore((state) => state.clearActiveTracking);

  useEffect(() => {
    if (!trackedTripId) return;
    setActiveTracking({ routeId: selectedId, tripId: trackedTripId });
    return () => clearActiveTracking();
  }, [selectedId, trackedTripId, setActiveTracking, clearActiveTracking]);

  const sortedStops = selectedRoute?.stops
    ? [...selectedRoute.stops].sort((a, b) => a.stopOrder - b.stopOrder)
    : [];

  return (
    <div>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Mapa de rutas</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualiza el recorrido y las paradas de cada ruta nocturna.
          </p>
        </div>

        {trackedTripId && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shrink-0 ${
              isConnected && liveBus
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Radio size={15} className={isConnected && liveBus ? 'animate-pulse' : ''} />
            {liveBus ? 'Bus en vivo' : isConnected ? 'Esperando al bus...' : 'Conectando...'}
          </div>
        )}
      </div>

      <div className="mb-6">
        <RouteTabBar
          routes={routes}
          selectedId={selectedId}
          loading={routesLoading}
          onSelect={setSelectedId}
        />
      </div>

      {selectedId && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <LeafletMap
              selectedRoute={selectedRoute}
              loading={routeLoading}
              liveBus={liveBus}
              showLocateButton
            />
            <RouteMetaCards route={selectedRoute} stopsCount={sortedStops.length} />
          </div>
          <MapStopsSidebar
            stops={sortedStops}
            loading={routeLoading}
            onViewTrips={() => navigate(`/routes/${selectedId}`)}
          />
        </div>
      )}
    </div>
  );
}
