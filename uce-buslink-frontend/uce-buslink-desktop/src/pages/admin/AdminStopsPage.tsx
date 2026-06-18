import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { fetchStops, type ApiStop } from '../../services/adminService';

export function AdminStopsPage() {
  const { getToken } = useAuth();
  const [stops, setStops] = useState<ApiStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        const data = await fetchStops(token);
        setStops(data);
        setError(null);
      } catch {
        setError('No se pudieron cargar las paradas');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [trigger]);

  function refresh() {
    setLoading(true);
    setError(null);
    setTrigger((t) => t + 1);
  }

  const filtered = stops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Paradas</h1>
          <p className="text-gray-500 text-sm mt-1">{stops.length} paradas registradas</p>
        </div>
        <button
          onClick={refresh}
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
            placeholder="Buscar parada..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
          />
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No se encontraron paradas.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Latitud</th>
                <th className="px-5 py-3">Longitud</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((stop) => (
                <tr key={stop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                        <MapPin size={13} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-navy-900">{stop.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-mono">{stop.latitude.toFixed(5)}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 font-mono">{stop.longitude.toFixed(5)}</td>
                  <td className="px-5 py-4">
                    {stop.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle size={12} /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                        <XCircle size={12} /> Inactiva
                      </span>
                    )}
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
