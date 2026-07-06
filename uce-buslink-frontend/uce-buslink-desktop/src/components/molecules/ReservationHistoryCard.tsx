import { useState, useEffect } from 'react';
import { Clock, MapPin, User, Hash, Bus as BusIcon } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import type { ActiveReservationItem } from '../../types';
import { fetchBasicUserInfo, fetchBusById } from '../../services/tripService';
import { fetchSeatsByTrip } from '../../services/seatService';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED_BY_STUDENT: 'bg-red-100 text-red-600',
  CANCELLED_BY_ADMIN: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completado',
  CANCELLED_BY_STUDENT: 'Cancelado',
  CANCELLED_BY_ADMIN: 'Cancelado por Admin',
  NO_SHOW: 'Ausente',
  ACTIVE: 'Activo',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
}

interface ReservationHistoryCardProps {
  item: ActiveReservationItem;
}

export function ReservationHistoryCard({ item }: ReservationHistoryCardProps) {
  const { getToken } = useAuth();
  const { trip, route, reservation } = item;

  const [driver, setDriver] = useState<{firstName: string, lastName: string} | null>(null);
  const [bus, setBus] = useState<{internalCode: string, plateNumber: string} | null>(null);
  const [seatNum, setSeatNum] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) return;
        
        if (trip.driverId && !driver) {
           fetchBasicUserInfo(token, trip.driverId).then(d => !cancelled && setDriver(d)).catch(()=>{});
        }
        if (trip.busId && !bus) {
           fetchBusById(token, trip.busId).then(b => !cancelled && setBus(b)).catch(()=>{});
        }
        if (reservation.seatId && seatNum === null) {
           fetchSeatsByTrip(token, trip.id).then(seats => {
             if (cancelled) return;
             const s = seats.find(x => x.id === reservation.seatId);
             if (s) setSeatNum(s.seatNumber);
           }).catch(()=>{});
        }
      } catch (e) {}
    }
    loadData();
    return () => { cancelled = true; };
  }, [trip, reservation, getToken, driver, bus, seatNum]);

  const statusStyle = STATUS_STYLES[reservation.status] ?? 'bg-gray-100 text-gray-600';
  const statusLabel = STATUS_LABELS[reservation.status] ?? reservation.status;

  const stops = route.stops ?? [];
  const boardingStop = stops.find(s => s.stopId === reservation.boardingStopId);
  const origin = boardingStop?.stopName ?? stops[0]?.stopName ?? '—';
  const destination = stops[stops.length - 1]?.stopName ?? '—';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-navy-900 text-base mb-1">{route.name}</h3>
          <span className="text-xs text-gray-500 capitalize">{formatDate(trip.departureTime)}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-navy-400" />
          <span className="font-medium text-navy-800">{origin}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="text-transparent" />
          <span className="truncate">{destination}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5 font-medium text-navy-900 bg-gray-100 px-2 py-1 rounded-md">
          <Clock size={13} className="text-gray-400" />
          {formatTime(trip.departureTime)}
        </span>
        <span className="flex items-center gap-1.5">
          <Hash size={13} className="text-gray-400" />
          Asiento {seatNum !== null ? seatNum : '...'}
        </span>
        <span className="flex items-center gap-1.5">
          <BusIcon size={13} className="text-gray-400" />
          {bus ? bus.internalCode : '...'}
        </span>
        <span className="flex items-center gap-1.5">
          <User size={13} className="text-gray-400" />
          {driver ? `${driver.firstName} ${driver.lastName}` : '...'}
        </span>
      </div>
    </div>
  );
}
