import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Clock, Bus, AlertCircle, RefreshCw } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import { useDebounce } from '../hooks/useDebounce';
import type { ApiRoute } from '../types';

function RouteCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="h-5 bg-gray-100 rounded w-3/4 mb-5" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-5" />
      <div className="h-8 bg-gray-100 rounded-lg w-1/3 mb-5" />
      <div className="h-10 bg-gray-100 rounded-xl w-full mt-auto" />
    </div>
  );
}

function RouteCard({
  route,
  onViewTrips,
}: {
  route: ApiRoute;
  onViewTrips: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-navy-900 leading-tight pr-2">
          {route.name}
        </h3>
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Bus size={16} className="text-gray-600" />
        </div>
      </div>

      {route.description && (
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          {route.description}
        </p>
      )}

      {route.estimatedDurationMinutes !== null && (
        <div className="flex items-center gap-1.5 mb-5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500">
            {route.estimatedDurationMinutes} min aprox.
          </span>
        </div>
      )}

      <button
        onClick={onViewTrips}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors mt-auto"
      >
        Ver viajes
      </button>
    </div>
  );
}

export function RoutesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const navigate = useNavigate();
  const { routes, loading, error, refetch } = useRoutes();

  const query = debouncedQuery.trim().toLowerCase();
  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(query) ||
    (route.description?.toLowerCase().includes(query) ?? false)
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Rutas disponibles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Consulta los trayectos nocturnos y asegura tu lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ruta..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 w-52 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} />
            Filtrar por horario
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            title="Recargar rutas"
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Recargar
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No se pudieron cargar las rutas</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      )}

      {!loading && !error && routes.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SlidersHorizontal size={28} className="opacity-40" />
          </div>
          <p className="font-semibold text-gray-500 mb-1">No hay rutas disponibles</p>
          <p className="text-sm">Por el momento no existen rutas activas. Intenta mas tarde.</p>
        </div>
      )}

      {!loading && !error && routes.length > 0 && filteredRoutes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-500 mb-1">Sin resultados</p>
          <p className="text-sm">No se encontraron rutas para &quot;{debouncedQuery}&quot;</p>
        </div>
      )}

      {!loading && !error && filteredRoutes.length > 0 && (
        <div className="grid grid-cols-3 gap-5">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onViewTrips={() => navigate(`/routes/${route.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
