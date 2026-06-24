import { useState } from 'react';
import type { ReactNode } from 'react';
import { Ticket, Clock, Armchair, User as UserIcon, Bus, X } from 'lucide-react';
import type { ReservationHistoryItem as ActiveReservation } from '../../services/reservationService';

function ReservationField({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-white/40 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}

interface ActiveReservationCardProps {
  reservation: ActiveReservation;
  onCancel: () => void;
}

export function ActiveReservationCard({ reservation, onCancel }: ActiveReservationCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-navy-900 rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={16} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              Tu reserva activa
            </span>
          </div>
          <span className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full">
            {reservation.date}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mt-1">
          {reservation.routeName}{' '}
          <span className="text-white/50 font-medium text-base">→ {reservation.destination}</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <ReservationField icon={<Clock size={14} />} label="Horario" value={`${reservation.time} hrs`} />
          <ReservationField icon={<Armchair size={14} />} label="Lugar" value={reservation.seat} />
          <ReservationField icon={<UserIcon size={14} />} label="Conductor" value={reservation.driver} />
          <ReservationField icon={<Bus size={14} />} label="Unidad" value={reservation.unit} />
        </div>
      </div>

      <div className="bg-white/5 px-6 py-4 border-t border-white/10">
        {confirming ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-white/80">¿Seguro que deseas cancelar esta reserva?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
              >
                No, mantener
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
          >
            <X size={16} />
            Cancelar reserva
          </button>
        )}
      </div>
    </div>
  );
}
