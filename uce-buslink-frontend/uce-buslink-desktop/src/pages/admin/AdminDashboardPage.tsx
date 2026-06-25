import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Truck, MapPin, ChevronRight, CheckCircle, XCircle, BarChart2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRoutes } from '../../hooks/useRoutes';
import { fetchBuses, fetchStops, fetchDailyRouteReports } from '../../services/adminService';
import type { RouteDailyReport } from '../../services/adminService';
import { useCurrentUser } from '../../context/AuthContext';
// Importaciones de Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StatCard({
  icon,
  label,
  value,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-navy-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {onClick && <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />}
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { getToken } = useAuth();
  const { routes, loading: routesLoading } = useRoutes();

  const [busCount, setBusCount] = useState<number | null>(null);
  const [stopCount, setStopCount] = useState<number | null>(null);
  
  // Nuevo estado para los reportes
  const [reports, setReports] = useState<RouteDailyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive).length, [routes]);

  useEffect(() => {
    async function loadData() {
      const token = await getToken({ template: 'uce-buslink' }).catch(() => null);
      if (!token) return;

      // Cargar Estadísticas Básicas
      fetchBuses(token, 0, 1)
        .then((p) => setBusCount(p.totalElements))
        .catch(() => setBusCount(0));
        
      fetchStops(token)
        .then((s) => setStopCount(s.length))
        .catch(() => setStopCount(0));

      // Cargar Reportes Diarios para la gráfica
      setReportsLoading(true);
      fetchDailyRouteReports(token, 0, 5)
        .then((res) => setReports(res.content || []))
        .catch((err) => console.error("Error cargando reportes:", err))
        .finally(() => setReportsLoading(false));
    }
    loadData();
  }, [getToken]);

  // Formatear datos para la gráfica (nombre más corto si es muy largo)
  const chartData = useMemo(() => {
    return reports.map(report => ({
      name: report.route_name.length > 15 ? `${report.route_name.substring(0, 15)}...` : report.route_name,
      Reservas: report.total_reservations,
      Viajes: report.total_trips,
      'No Shows': report.no_shows
    }));
  }, [reports]);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">
          Bienvenido, {user?.firstName || 'Administrador'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Panel de administración — UCE Bus-Link
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard
          icon={<Bus size={22} className="text-navy-700" />}
          label="Rutas activas"
          value={routesLoading ? '...' : activeRoutes}
          sub={`de ${routes.length} totales`}
          onClick={() => navigate('/admin/routes')}
        />
        <StatCard
          icon={<Truck size={22} className="text-amber-600" />}
          label="Buses"
          value={busCount ?? '...'}
          sub="en flota"
          onClick={() => navigate('/admin/buses')}
        />
        <StatCard
          icon={<MapPin size={22} className="text-green-600" />}
          label="Paradas"
          value={stopCount ?? '...'}
          sub="registradas"
          onClick={() => navigate('/admin/stops')}
        />
      </div>

      {/* SECCIÓN DIVIDIDA EN DOS COLUMNAS: GRÁFICA Y LISTA DE RUTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICA DE REPORTES DIARIOS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={18} className="text-navy-700" />
            <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
              Reporte Diario de Rutas
            </h2>
          </div>

          <div className="flex-1 min-h-[300px]">
            {reportsLoading ? (
              <div className="h-full w-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
                Cargando métricas...
              </div>
            ) : reports.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                No hay datos para mostrar
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="Reservas" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Viajes" fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="No Shows" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* LISTA DE RUTAS (Tu código original mantenido y encajado) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
              Rutas del sistema
            </h2>
            <button
              onClick={() => navigate('/admin/routes')}
              className="text-xs text-navy-700 font-semibold hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          {routesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {routes.slice(0, 5).map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/routes/${route.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Bus size={15} className="text-navy-700 flex-shrink-0" />
                    <span className="text-sm font-medium text-navy-900 truncate">{route.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {route.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle size={13} /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <XCircle size={13} /> Inactiva
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}