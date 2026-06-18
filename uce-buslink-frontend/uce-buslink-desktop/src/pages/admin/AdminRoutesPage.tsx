import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CheckCircle, XCircle, Clock, MapPin, Eye, RefreshCw } from 'lucide-react';
import { useRoutes } from '../../hooks/useRoutes';

export function AdminRoutesPage() {
  const navigate = useNavigate();
  const { routes, loading, error, refetch } = useRoutes();
  const [search, setSearch] = useState('');

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Rutas</h1>
          <p className="text-gray-500 text-sm mt-1">
            {routes.length} rutas registradas en el sistema
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} />
          Recargar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar ruta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
          />
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No se encontraron rutas.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3">Duración</th>
                <th className="px-5 py-3">Paradas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((route) => (
                <tr
                  key={route.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bus size={14} className="text-navy-700" />
                      </div>
                      <span className="text-sm font-semibold text-navy-900">{route.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-500 truncate max-w-[200px] block">
                      {route.description ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={13} className="text-amber-500" />
                      {route.estimatedDurationMinutes
                        ? `${route.estimatedDurationMinutes} min`
                        : '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={13} className="text-navy-500" />
                      {route.stops?.length ?? 0}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {route.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle size={12} /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                        <XCircle size={12} /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate(`/admin/routes/${route.id}`)}
                      className="flex items-center gap-1.5 text-xs font-medium text-navy-700 hover:text-navy-900 transition-colors"
                    >
                      <Eye size={14} />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
