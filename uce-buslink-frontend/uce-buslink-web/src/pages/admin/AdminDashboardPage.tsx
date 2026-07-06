import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Truck, MapPin, ChevronRight, CheckCircle, XCircle, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRoutes } from '../../hooks/useRoutes';
import { fetchBuses, fetchStops, fetchDailyRouteReports, type ApiBus } from '../../services/adminService';
import type { RouteDailyReport } from '../../services/adminService';
import { useCurrentUser } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

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
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-navy-100 transition-all' : ''
        }`}
    >
      <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-navy-700">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black text-navy-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1.5 font-medium">{sub}</p>}
      </div>
      {onClick && <ChevronRight size={20} className="text-gray-300 flex-shrink-0 group-hover:text-navy-500 transition-colors" />}
    </div>
  );
}

// Datos simulados para la tendencia de uso (Pasajeros)
const MOCK_TREND_DATA = [
  { name: 'Lun', pasajeros: 450 },
  { name: 'Mar', pasajeros: 520 },
  { name: 'Mie', pasajeros: 480 },
  { name: 'Jue', pasajeros: 610 },
  { name: 'Vie', pasajeros: 590 },
  { name: 'Sab', pasajeros: 200 },
  { name: 'Dom', pasajeros: 150 },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { getToken } = useAuth();
  const { routes, loading: routesLoading } = useRoutes();

  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [stopCount, setStopCount] = useState<number | null>(null);

  const [reports, setReports] = useState<RouteDailyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive).length, [routes]);

  useEffect(() => {
    async function loadData() {
      const token = await getToken({ template: 'uce-buslink' }).catch(() => null);
      if (!token) return;

      fetchBuses(token, 0, 100)
        .then((p) => setBuses(p.content))
        .catch(() => setBuses([]));

      fetchStops(token)
        .then((s) => setStopCount(s.length))
        .catch(() => setStopCount(0));

      setReportsLoading(true);
      fetchDailyRouteReports(token, 0, 5)
        .then((res) => setReports(res.content || []))
        .catch((err) => console.error("Error cargando reportes:", err))
        .finally(() => setReportsLoading(false));
    }
    loadData();
  }, [getToken]);

  const chartData = useMemo(() => {
    return reports.map(report => ({
      name: report.route_name.length > 15 ? `${report.route_name.substring(0, 15)}...` : report.route_name,
      Reservas: report.total_reservations,
      Viajes: report.total_trips,
      'No Shows': report.no_shows
    }));
  }, [reports]);

  const fleetData = useMemo(() => {
    const counts = { OPERATIONAL: 0, MAINTENANCE: 0, OUT_OF_SERVICE: 0 };
    buses.forEach(b => {
      if (counts[b.operationalStatus as keyof typeof counts] !== undefined) {
        counts[b.operationalStatus as keyof typeof counts]++;
      }
    });
    return [
      { name: 'Operativos', value: counts.OPERATIONAL, color: '#10b981' }, // Verde
      { name: 'Mantenimiento', value: counts.MAINTENANCE, color: '#f59e0b' }, // Amarillo
      { name: 'Fuera de Servicio', value: counts.OUT_OF_SERVICE, color: '#ef4444' }, // Rojo
    ].filter(d => d.value > 0);
  }, [buses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-sm mt-1.5 font-medium">
            Hola, {user?.firstName || 'Administrador'} — Aquí tienes un resumen del sistema UCE Bus-Link
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={<Bus size={26} />}
          label="Rutas activas"
          value={routesLoading ? '...' : activeRoutes}
          sub={`de ${routes.length} rutas totales registradas`}
          onClick={() => navigate('/admin/routes')}
        />
        <StatCard
          icon={<Truck size={26} />}
          label="Flota de Buses"
          value={buses.length || '...'}
          sub="Unidades en el sistema"
          onClick={() => navigate('/admin/buses')}
        />
        <StatCard
          icon={<MapPin size={26} />}
          label="Paradas"
          value={stopCount ?? '...'}
          sub="Puntos georeferenciados"
          onClick={() => navigate('/admin/stops')}
        />
      </div>

      {/* DASHBOARD CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GRÁFICA PRINCIPAL: BARRAS */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-navy-50 rounded-lg"><BarChart2 size={18} className="text-navy-700" /></div>
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wide">Rendimiento por Ruta (Hoy)</h2>
            </div>
          </div>

          <div className="flex-1 min-h-[320px]">
            {reportsLoading ? (
              <div className="h-full w-full bg-gray-50 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm font-medium">
                Cargando métricas...
              </div>
            ) : reports.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-xl">
                No hay datos operativos para mostrar hoy
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px', fontWeight: 500 }} />
                  <Bar dataKey="Reservas" fill="#1e3a8a" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="Viajes" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="No Shows" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: PIE CHART & LISTA */}
        <div className="space-y-6">
          {/* ESTADO DE FLOTA (PIE CHART) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg"><PieChartIcon size={18} className="text-amber-600" /></div>
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wide">Estado de Flota</h2>
            </div>

            <div className="h-[220px]">
              {buses.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium border-2 border-dashed border-gray-100 rounded-xl">Sin datos de buses</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fleetData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {fleetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* RUTAS RÁPIDAS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wide">Rutas Destacadas</h2>
              <button
                onClick={() => navigate('/admin/routes')}
                className="text-xs text-navy-600 font-bold hover:text-navy-800 flex items-center gap-1 transition-colors"
              >
                Ver todas <ChevronRight size={14} />
              </button>
            </div>

            {routesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {routes.slice(0, 4).map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-navy-50/50 border border-transparent hover:border-navy-100 transition-all cursor-pointer group"
                    onClick={() => navigate(`/admin/routes/${route.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-navy-700 group-hover:text-navy-900">
                        <MapPin size={14} />
                      </div>
                      <span className="text-sm font-bold text-navy-900 truncate">{route.name}</span>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {route.isActive ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GRÁFICO DE TENDENCIA (LÍNEA) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-50 rounded-lg"><Activity size={18} className="text-green-600" /></div>
            <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wide">Tendencia de Pasajeros (Semanal)</h2>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }} />
                <Tooltip
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="pasajeros"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}