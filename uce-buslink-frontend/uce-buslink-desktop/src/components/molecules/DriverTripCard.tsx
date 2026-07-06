import { useState, useEffect } from 'react';
import { Clock, Armchair, BusFront, ShieldCheck, Timer, CheckCircle, AlertCircle } from 'lucide-react';
import type { DriverTripView } from '../../types';

const STATE_STYLES: Record<string, { bg: string, text: string }> = {
  SCHEDULED: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  ONGOING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  COMPLETED: { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
  CANCELLED: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
};

const STATE_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  ONGOING: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

interface DriverTripCardProps {
  trip: DriverTripView;
  onClick: () => void;
}

export function DriverTripCard({ trip, onClick }: DriverTripCardProps) {
  const stateStyle = STATE_STYLES[trip.state] ?? { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700' };
  const stateLabel = STATE_LABELS[trip.state] ?? trip.state;

  const date = new Date(trip.departureTime);
  const time = date.toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, isPast: boolean } | null>(null);

  useEffect(() => {
    if (trip.state !== 'SCHEDULED') {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const isPast = diffMs < 0;
      const absDiff = Math.abs(diffMs);

      const hours = Math.floor(absDiff / 3600000);
      const minutes = Math.floor((absDiff % 3600000) / 60000);
      const seconds = Math.floor((absDiff % 60000) / 1000);

      setTimeLeft({ hours, minutes, seconds, isPast });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [trip.departureTime, trip.state]);

  const getCountdownStyle = () => {
    if (!timeLeft) return 'text-gray-500';
    if (timeLeft.isPast) return 'text-red-600 bg-red-50 border border-red-100 font-bold';

    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutes <= 5) return 'text-red-600 bg-red-50 border border-red-100 font-bold animate-pulse';
    if (totalMinutes <= 15) return 'text-amber-600 bg-amber-50 border border-amber-100 font-bold';
    return 'text-blue-600 bg-blue-50 border border-blue-100 font-medium';
  };

  const formatPlate = (id: string) => {
    if (!id) return 'N/A';
    if (id.length > 10) {
      return `${id.substring(0, 3)}-${id.substring(4, 8)}`.toUpperCase();
    }
    return id.toUpperCase();
  };

  const formatTimeNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl shadow-sm border px-5 py-4 mb-3 transition-all flex flex-col gap-3 group hover:-translate-y-1 hover:shadow-md ${stateStyle.bg}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
            <ShieldCheck size={14} /> Asignado a ti
          </span>
          <h3 className="font-bold text-navy-900 text-lg leading-tight group-hover:text-primary transition-colors">
            {trip.routeName}
          </h3>
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md mb-1 ${stateStyle.text} bg-white/60`}>
            {stateLabel}
          </span>
          <div className="flex items-center gap-1.5 font-black text-2xl text-navy-900">
            <Clock size={20} className="text-gray-400" />
            {time}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full pt-3 border-t border-gray-900/5">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-white/50 px-2.5 py-1 rounded-lg">
          <BusFront size={16} className="text-gray-400" />
          <span className="font-medium">Placa: <span className="text-navy-900 font-bold">{formatPlate(trip.busId)}</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-white/50 px-2.5 py-1 rounded-lg">
          <Armchair size={16} className="text-gray-400" />
          <span className="font-medium">{trip.availableSeats} libres</span>
        </div>
      </div>

      {timeLeft !== null && (
        <div className={`mt-2 flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl shadow-inner ${getCountdownStyle()}`}>
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
            {timeLeft.isPast ? 'Tiempo excedido' : 'Tiempo para salir'}
          </span>
          <div className="flex items-center gap-2 text-xl tracking-widest font-mono">
            <Timer size={18} className={timeLeft.isPast ? "text-red-500" : ""} />
            <span>{formatTimeNumber(timeLeft.hours)}</span>:
            <span>{formatTimeNumber(timeLeft.minutes)}</span>:
            <span>{formatTimeNumber(timeLeft.seconds)}</span>
          </div>
        </div>
      )}

      {trip.state === 'COMPLETED' && (
        <div className="mt-2 flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl shadow-inner bg-emerald-50 border border-emerald-200 text-emerald-700">
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
            Estado del viaje
          </span>
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle size={18} className="text-emerald-500" />
            Viaje Finalizado Exitosamente
          </div>
        </div>
      )}

      {trip.state === 'CANCELLED' && (
        <div className="mt-2 flex flex-col items-center justify-center gap-1 w-full py-2.5 rounded-xl shadow-inner bg-red-50 border border-red-200 text-red-700">
          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">
            Estado del viaje
          </span>
          <div className="flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={18} className="text-red-500" />
            Viaje Cancelado
          </div>
        </div>
      )}
    </button>
  );
}
