import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Truck, MapPin, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRoutes } from '../../hooks/useRoutes';
import { fetchBuses, fetchStops } from '../../services/adminService';
import { useCurrentUser } from '../../context/AuthContext';

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
  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive).length, [routes]);

  useEffect(() => {
    async function loadStats() {
      const token = await getToken({ template: 'uce-buslink' }).catch(() => null);
      if (!token) return;
      fetchBuses(token, 0, 1)
        .then((p) => setBusCount(p.totalElements))
        .catch(() => setBusCount(0));
      fetchStops(token)
        .then((s) => setStopCount(s.length))
        .catch(() => setStopCount(0));
    }
    loadStats();
  }, [getToken]);

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
            {Array.from({ length: 3 }).map((_, i) => (
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
                  {route.description && (
                    <span className="text-xs text-gray-400 truncate hidden md:block">
                      — {route.description}
                    </span>
                  )}
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
  );
}
