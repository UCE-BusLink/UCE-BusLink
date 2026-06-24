import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoutes } from '../hooks/useRoutes';
import { useRoute } from '../hooks/useRoute';
import { RouteTabBar, LeafletMap, RouteMetaCards, MapStopsSidebar } from '../components/molecules';

export function MapPage() {
  const navigate = useNavigate();
  const { routes, loading: routesLoading } = useRoutes();
  const [manualSelectedId, setSelectedId] = useState<string>('');
  const selectedId = manualSelectedId || routes[0]?.id || '';
  const { route: selectedRoute, loading: routeLoading } = useRoute(selectedId);

  const sortedStops = selectedRoute?.stops
    ? [...selectedRoute.stops].sort((a, b) => a.stopOrder - b.stopOrder)
    : [];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Mapa de rutas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visualiza el recorrido y las paradas de cada ruta nocturna.
        </p>
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
            <LeafletMap selectedRoute={selectedRoute} loading={routeLoading} />
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
