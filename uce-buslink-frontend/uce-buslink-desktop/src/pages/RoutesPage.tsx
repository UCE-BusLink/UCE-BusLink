import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import { useDebounce } from '../hooks/useDebounce';
import { RouteCardSkeleton } from '../components/atoms';
import { RouteCard, RoutesToolbar, EmptyState } from '../components/molecules';

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
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Rutas disponibles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Consulta los trayectos nocturnos y asegura tu lugar.
          </p>
        </div>
        <RoutesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefetch={refetch}
          loading={loading}
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <EmptyState
          icon={<AlertCircle size={28} className="text-red-400" />}
          iconBg="bg-red-50"
          title="No se pudieron cargar las rutas"
          description={error}
        />
      )}

      {!loading && !error && routes.length === 0 && (
        <EmptyState
          icon={<SlidersHorizontal size={28} className="opacity-40" />}
          title="No hay rutas disponibles"
          description="Por el momento no existen rutas activas. Intenta mas tarde."
        />
      )}

      {!loading && !error && routes.length > 0 && filteredRoutes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-500 mb-1">Sin resultados</p>
          <p className="text-sm">No se encontraron rutas para &quot;{debouncedQuery}&quot;</p>
        </div>
      )}

      {!loading && !error && filteredRoutes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              variant="full"
              onSelect={() => navigate(`/routes/${route.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
