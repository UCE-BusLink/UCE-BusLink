import { useState, useEffect } from 'react';
import { Ticket, Clock, QrCode, X, MapPin, User, Bus as BusIcon, Hash } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { fetchBasicUserInfo, fetchBusById } from '../../services/tripService';
import { fetchSeatsByTrip } from '../../services/seatService';
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

  const stops = route.stops ?? [];
  const boardingStop = stops.find(s => s.stopId === reservation.boardingStopId);
  const origin = boardingStop?.stopName ?? stops[0]?.stopName ?? '—';
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

        <div className="flex flex-col gap-1.5 mt-1 text-sm text-white/50">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="truncate">Sube en: <strong className="text-white/80 font-medium">{origin}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="opacity-0" />
            <span className="truncate">Baja en: {destination}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-white/70">
          <span className="flex items-center gap-1">
            <User size={12} className="text-white/40" />
            {driver ? `${driver.firstName} ${driver.lastName}` : 'Cargando...'}
          </span>
          <span className="flex items-center gap-1">
            <BusIcon size={12} className="text-white/40" />
            {bus ? `Unidad ${bus.internalCode}` : 'Cargando...'}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-400/10 px-2 py-0.5 rounded-full">
            <Hash size={12} />
            Asiento {seatNum !== null ? seatNum : '...'}
          </span>
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
