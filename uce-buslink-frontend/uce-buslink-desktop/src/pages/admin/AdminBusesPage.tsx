import { useState, useEffect } from 'react';
import { Truck, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { fetchBuses, type ApiBus } from '../../services/adminService';

export function AdminBusesPage() {
  const { getToken } = useAuth();
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        const page = await fetchBuses(token, 0, 50);
        setBuses(page.content);
        setTotal(page.totalElements);
        setError(null);
      } catch {
        setError('No se pudieron cargar los buses');
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

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Buses</h1>
          <p className="text-gray-500 text-sm mt-1">{total} unidades en flota</p>
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
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : buses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No hay buses registrados.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Placa</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Fabricante / Modelo</th>
                <th className="px-5 py-3">Capacidad</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {buses.map((bus) => (
                <tr key={bus.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <Truck size={14} className="text-amber-600" />
                      </div>
                      <span className="text-sm font-semibold text-navy-900">{bus.plateNumber}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{bus.internalCode}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {bus.manufacturer} {bus.model}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{bus.seatCapacity} asientos</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full w-fit">
                      <CheckCircle size={12} />
                      {bus.operationalStatus}
                    </span>
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
