import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOff, Clock, ShieldCheck, Ticket } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { useReservationHistory } from '../hooks/useReservationHistory';
import { ActiveReservationCard, QrModal, ReservationHistoryCard } from '../components/molecules';
import { Spinner } from '../components/atoms';
import { cancelReservation } from '../services/reservationService';
import type { ActiveReservationItem } from '../types';

export function TripsPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { items, loading, error, refetch } = useActiveReservations();

  const { items: historyItems, loading: historyLoading, page, setPage, totalPages, refetch: refetchHistory } = useReservationHistory(5);

  const [qrItem, setQrItem] = useState<ActiveReservationItem | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(item: ActiveReservationItem) {
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setCancellingId(item.reservation.id);

    const previous = queryClient.getQueriesData<ActiveReservationItem[]>({ queryKey: ['active-reservations'] });
    queryClient.setQueriesData<ActiveReservationItem[]>(
      { queryKey: ['active-reservations'] },
      (old) => old?.filter((i) => i.reservation.id !== item.reservation.id)
    );

    try {
      await cancelReservation(token, item.reservation.id, 'Cancelado por el estudiante');
      toast.success('Reserva cancelada.');
      refetchHistory();
    } catch {
      previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    } finally {
      setCancellingId(null);
      refetch();
    }
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

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
            Historial
          </h2>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : historyItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center text-gray-400">
            <p className="text-sm">No hay reservas anteriores.</p>
          </div>
        ) : (
          <>
            {historyItems.map((item) => (
              <ReservationHistoryCard key={item.reservation.id} item={item} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="text-xs font-medium text-navy-900 disabled:opacity-30 hover:underline"
                >
                  Anterior
                </button>
                <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="text-xs font-medium text-navy-900 disabled:opacity-30 hover:underline"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between mb-5 mt-10">
        <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
          Información de Abordaje
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
              <Clock size={24} />
            </div>
            <h3 className="font-semibold text-navy-900 mb-1">Llega a tiempo</h3>
            <p className="text-xs text-gray-500">Asegúrate de estar en tu parada al menos 5 minutos antes de la hora de salida.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
              <Ticket size={24} />
            </div>
            <h3 className="font-semibold text-navy-900 mb-1">Ten tu QR listo</h3>
            <p className="text-xs text-gray-500">Abre tu código QR antes de subir a la unidad para agilizar el abordaje de todos.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-semibold text-navy-900 mb-1">Respeta tu asiento</h3>
            <p className="text-xs text-gray-500">Cada boleto tiene un asiento asignado. Por favor ocupa únicamente el tuyo.</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={() => navigate('/routes')}
            className="px-6 py-2.5 bg-navy-900 text-white text-sm font-medium rounded-xl hover:bg-navy-800 transition-colors shadow-md"
          >
            Explorar y reservar nuevas rutas
          </button>
        </div>
      </div>

      {qrItem && (
        <QrModal
          qrCode={qrItem.reservation.id}
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
