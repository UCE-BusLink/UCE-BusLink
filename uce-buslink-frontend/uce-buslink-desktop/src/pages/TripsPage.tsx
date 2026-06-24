import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOff, CheckCircle2 } from 'lucide-react';
import type { Trip, Route } from '../types';
import type { ReservationHistoryItem as ActiveReservation } from '../services/reservationService';
import { TripCard, ActiveReservationCard } from '../components/molecules';

export function TripsPage() {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ActiveReservation | null>(null);
  const [justCancelled, setJustCancelled] = useState(false);

  const availableTrips: { trip: Trip; route: Route }[] = [];

  function handleCancel() {
    setReservation(null);
    setJustCancelled(true);
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Viajes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona tu reserva activa y elige tu próximo viaje nocturno.
        </p>
      </div>

      {justCancelled && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 mb-6">
          <CheckCircle2 size={16} />
          Tu reserva fue cancelada correctamente.
        </div>
      )}

      {reservation ? (
        <ActiveReservationCard reservation={reservation} onCancel={handleCancel} />
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 mb-8">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CalendarOff size={24} className="opacity-40" />
          </div>
          <p className="font-semibold text-gray-500 mb-1">No tienes reservas activas</p>
          <p className="text-sm">Elige un viaje disponible para reservar tu lugar.</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
          Viajes disponibles
        </h2>
        <span className="text-xs text-gray-400">{availableTrips.length} viajes</span>
      </div>

      {availableTrips.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {availableTrips.map(({ trip, route }) => (
            <TripCard
              key={trip.id}
              trip={trip}
              route={route}
              onSelect={() => navigate(`/routes/${route.id}/seats/${trip.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <CalendarOff size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-gray-500 mb-1">No hay viajes disponibles</p>
          <p className="text-sm">Vuelve más tarde para reservar tu lugar.</p>
        </div>
      )}
    </div>
  );
}
