import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useRoutes } from '../hooks/useRoutes';
import { useTrustScore } from '../hooks/useTrustScore';
import { ReservationCard } from '../components/molecules/ReservationCard';
import { RouteCard } from '../components/molecules/RouteCard';
import { StatCard } from '../components/molecules/StatCard';
import { RouteCardSkeleton, TrustScoreRing } from '../components/atoms';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const greeting = getTimeGreeting();
  const { user: clerkUser } = useUser();
  const { routes, loading: routesLoading } = useRoutes();
  const trustScore = useTrustScore();

  const displayRoutes = routes.slice(0, 3);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">
          {greeting}, {clerkUser?.firstName ?? '...'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Aquí el resumen del día de tus viajes pendientes
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
              Tu próxima reserva
            </p>
            <ReservationCard
              reservation={null}
              onNavigateToRoutes={() => navigate('/routes')}
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-navy-900 mb-4">
              Rutas disponibles hoy
            </h2>
            {routesLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RouteCardSkeleton key={i} />
                ))}
              </div>
            ) : displayRoutes.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {displayRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    onSelect={() => navigate(`/routes/${route.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No hay rutas disponibles.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Star size={15} className="text-amber-500" />
              <p className="text-sm font-semibold text-navy-900">Score de confianza</p>
            </div>
            <p className="text-xs text-gray-400 mb-5">Pendiente de datos del servidor</p>
            <TrustScoreRing score={trustScore} />
            <p className="text-xs text-center text-gray-500 mt-3">
              Mantén este nivel para prioridad de reserva
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Estadísticas
            </p>
            <div className="space-y-3">
              <StatCard label="Viajes totales" value={null} />
              <StatCard label="Puntualidad" value={null} valueClassName="text-green-600" />
              <StatCard label="Destino frecuente" value={null} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
