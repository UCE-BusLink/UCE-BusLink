import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Bus, QrCode } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../services/api';
import { useRoutes } from '../hooks/useRoutes';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { RouteCard } from '../components/molecules/RouteCard';
import { StatCard } from '../components/molecules/StatCard';
import { QrModal } from '../components/molecules/QrModal';
import { RouteCardSkeleton, TrustScoreRing, Button, Spinner } from '../components/atoms';
import { useCurrentUser } from '../context/AuthContext';
import type { ActiveReservationItem } from '../types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const greeting = getTimeGreeting();
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { syncDone } = useCurrentUser();
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = await getToken({ template: "uce-buslink" });
      if (!token) throw new Error("No token");
      return getUserProfile(token);
    },
    enabled: isLoaded && isSignedIn && syncDone,
  });

  const { routes, loading: routesLoading } = useRoutes();
  const { items, loading: reservationLoading } = useActiveReservations();

  const trustScore = profile?.puntuacionConfianza?.puntuacion ?? 0;
  const trustLevel = profile?.puntuacionConfianza?.nivel ?? 'Desconocido';

  const [qrItem, setQrItem] = useState<ActiveReservationItem | null>(null);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">
              Tus reservas activas
            </p>

            {reservationLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bus size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Sin reservas activas</p>
                <p className="text-xs text-gray-400 mt-1">Reserva un lugar en la sección de Rutas</p>
                <Button size="sm" onClick={() => navigate('/routes')} className="mt-4">
                  Ver rutas
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <div
                    key={item.reservation.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy-900">{item.route.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatTime(item.trip.departureTime)} · {formatDate(item.trip.departureTime)}
                      </p>
                    </div>
                    <button
                      onClick={() => setQrItem(item)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-navy-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <QrCode size={13} />
                      Ver QR
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-base font-semibold text-navy-900 mb-4">
              Rutas disponibles hoy
            </h2>
            {routesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RouteCardSkeleton key={i} />
                ))}
              </div>
            ) : displayRoutes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <p className="text-xs text-gray-400 mb-5">Nivel: {trustLevel}</p>
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
              <StatCard label="Viajes totales" value={profile?.estadisticas?.viajesTotales?.toString() ?? "0"} />
              <StatCard label="Reservas completadas" value={profile?.puntuacionConfianza?.reservasCompletadas?.toString() ?? "0"} valueClassName="text-green-600" />
              <StatCard label="No Shows" value={profile?.puntuacionConfianza?.noShows?.toString() ?? "0"} valueClassName="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {qrItem && (
        <QrModal
          qrCode={qrItem.reservation.id}
          title={qrItem.route.name}
          subtitle={formatTime(qrItem.trip.departureTime) + ' · ' + formatDate(qrItem.trip.departureTime)}
          onClose={() => setQrItem(null)}
        />
      )}
    </div>
  );
}
