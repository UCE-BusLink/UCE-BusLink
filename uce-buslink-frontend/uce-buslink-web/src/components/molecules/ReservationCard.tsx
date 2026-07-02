import { Bus, Calendar, Clock } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { NextReservationData } from '../../hooks/useNextReservation';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface ReservationCardProps {
  data: NextReservationData | null;
  loading?: boolean;
  onNavigateToRoutes: () => void;
}

export function ReservationCard({ data, loading, onNavigateToRoutes }: ReservationCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3 py-4">
        <div className="h-4 bg-gray-100 rounded w-1/3" />
        <div className="h-10 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  if (!data) {
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

  const { trip, route } = data;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
          <Bus size={14} className="text-amber-600" />
        </div>
        <span className="font-semibold text-navy-900">{route.name}</span>
      </div>

      <p className="text-5xl font-bold text-navy-900">{formatTime(trip.departureTime)}</p>

      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span className="capitalize">{formatDate(trip.departureTime)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{trip.availableSeats} cupos restantes</span>
        </div>
      </div>
    </div>
  );
}
