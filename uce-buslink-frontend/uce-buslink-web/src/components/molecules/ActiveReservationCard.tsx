import { useState } from 'react';
import { Ticket, Clock, QrCode, X, MapPin } from 'lucide-react';
import type { ActiveReservationItem } from '../../types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface ActiveReservationCardProps {
  item: ActiveReservationItem;
  onViewQr: () => void;
  onCancel: () => void;
  cancelling?: boolean;
}

export function ActiveReservationCard({ item, onViewQr, onCancel, cancelling }: ActiveReservationCardProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { trip, route } = item;

  const stops = route.stops ?? [];
  const origin = stops[0]?.stopName ?? '—';
  const destination = stops[stops.length - 1]?.stopName ?? '—';

  return (
    <div className="bg-navy-900 rounded-2xl shadow-sm overflow-hidden mb-4">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              Reserva activa
            </span>
          </div>
          <span className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full capitalize">
            {formatDate(trip.departureTime)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mt-1">{route.name}</h3>

        <div className="flex items-center gap-1.5 mt-1 text-sm text-white/50">
          <MapPin size={12} />
          <span className="truncate">{origin} → {destination}</span>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-white">
            <Clock size={14} className="text-white/40" />
            <span className="text-2xl font-bold">{formatTime(trip.departureTime)}</span>
          </div>
          <span className="text-xs text-white/40">{trip.availableSeats} cupos restantes</span>
        </div>
      </div>

      <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          onClick={onViewQr}
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <QrCode size={15} />
          Ver QR
        </button>

        {confirmingCancel ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmingCancel(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 transition-colors"
            >
              Mantener
            </button>
            <button
              onClick={() => { setConfirmingCancel(false); onCancel(); }}
              disabled={cancelling}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelando...' : 'Confirmar'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingCancel(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={15} />
            Cancelar reserva
          </button>
        )}
      </div>
    </div>
  );
}
