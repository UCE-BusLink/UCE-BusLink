import { Clock, MapPin, User, Hash } from 'lucide-react';
import type { ReservationHistoryItem } from '../../services/reservationService';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  ACTIVE: 'Activo',
};

interface ReservationHistoryCardProps {
  item: ReservationHistoryItem;
}

export function ReservationHistoryCard({ item }: ReservationHistoryCardProps) {
  const statusStyle = STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-600';
  const statusLabel = STATUS_LABELS[item.status] ?? item.status;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-3">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-navy-900 text-sm">{item.routeName}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
        <MapPin size={11} />
        <span>{item.destination}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {item.date} · {item.time}
        </span>
        <span className="flex items-center gap-1">
          <Hash size={11} />
          Asiento {item.seat}
        </span>
        <span className="flex items-center gap-1">
          <User size={11} />
          {item.driver}
        </span>
      </div>
    </div>
  );
}
