import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOff } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { ActiveReservationCard, QrModal } from '../components/molecules';
import { Spinner } from '../components/atoms';
import { cancelReservation } from '../services/reservationService';
import type { ActiveReservationItem } from '../types';

export function TripsPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { items, loading, error, refetch } = useActiveReservations();

  const [qrItem, setQrItem] = useState<ActiveReservationItem | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(item: ActiveReservationItem) {
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setCancellingId(item.reservation.id);
    await cancelReservation(token, item.reservation.id, 'Cancelado por el estudiante')
      .then(() => refetch())
      .catch(() => undefined)
      .finally(() => setCancellingId(null));
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Viajes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona tus reservas activas y elige tu próximo viaje.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400 mb-6">{error}</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 mb-8">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarOff size={24} className="opacity-40" />
          </div>
          <p className="font-semibold text-gray-500 mb-1">No tienes reservas activas</p>
          <p className="text-sm">Elige un viaje disponible para reservar tu lugar.</p>
        </div>
      ) : (
        <div className="mb-8">
          {items.map((item) => (
            <ActiveReservationCard
              key={item.reservation.id}
              item={item}
              onViewQr={() => setQrItem(item)}
              onCancel={() => handleCancel(item)}
              cancelling={cancellingId === item.reservation.id}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
          Viajes disponibles
        </h2>
      </div>

      <div className="text-center py-20 text-gray-400">
        <CalendarOff size={40} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium text-gray-500 mb-1">Explora rutas para reservar</p>
        <button
          onClick={() => navigate('/routes')}
          className="text-sm font-semibold text-navy-900 hover:underline mt-2"
        >
          Ver rutas disponibles
        </button>
      </div>

      {qrItem && (
        <QrModal
          qrCode={qrItem.reservation.qrCode}
          title={qrItem.route.name}
          subtitle={new Date(qrItem.trip.departureTime).toLocaleString('es-EC', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit', hour12: false,
          })}
          onClose={() => setQrItem(null)}
        />
      )}
    </div>
  );
}
