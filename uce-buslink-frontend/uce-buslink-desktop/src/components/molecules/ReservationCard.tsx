import { Bus, Calendar, Armchair, ChevronRight } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { ReservationHistoryItem } from '../../services/reservationService';

interface ReservationCardProps {
  reservation: ReservationHistoryItem | null;
  onNavigateToRoutes: () => void;
}

export function ReservationCard({ reservation, onNavigateToRoutes }: ReservationCardProps) {
  if (!reservation) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Bus size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-500">Sin reservas activas</p>
        <p className="text-xs text-gray-400 mt-1">Reserva un lugar en la sección de Rutas</p>
        <Button size="sm" onClick={onNavigateToRoutes} className="mt-4">
          Ver rutas
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bus size={14} className="text-amber-600" />
            </div>
            <span className="font-semibold text-navy-900">{reservation.routeName}</span>
          </div>
          <p className="text-5xl font-bold text-navy-900">{reservation.time}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{reservation.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Armchair size={14} />
              <span>{reservation.seat}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-0.5">Conductor</p>
          <p className="text-sm font-semibold text-navy-900">{reservation.driver}</p>
          <p className="text-xs text-gray-400 mt-2 mb-0.5">Unidad</p>
          <p className="text-sm font-semibold text-navy-900">{reservation.unit}</p>
        </div>
      </div>
      <button className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-navy-900 hover:text-amber-600 transition-colors">
        Pase de abordar
        <ChevronRight size={16} />
      </button>
    </>
  );
}
