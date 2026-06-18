import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Bus,
  User as UserIcon,
  MapPin,
  Armchair,
  Users,
  Ticket,
  CalendarOff,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { Trip, Route } from '../types';
import type { ActiveReservation } from '../services/reservationService';

function StatBadge({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: 'green' | 'amber';
}) {
  const styles =
    tone === 'green'
      ? 'bg-green-50 text-green-600'
      : 'bg-amber-50 text-amber-600';
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${styles}`}>
      {icon}
      <span className="text-xs font-semibold">
        {value} <span className="font-normal opacity-80">{label}</span>
      </span>
    </div>
  );
}

function TripCard({
  trip,
  route,
  onSelect,
}: {
  trip: Trip;
  route: Route;
  onSelect: () => void;
}) {
  const hasSpace = trip.availableSeats + trip.standingSpots > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-navy-900 leading-tight">
            {route.name}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={13} className="text-gray-400" />
            {route.destination}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-navy-900 font-bold">
            <Clock size={15} className="text-amber-500" />
            {trip.time}
          </div>
          <span className="text-xs text-gray-400 mt-1">hrs</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <UserIcon size={14} className="text-gray-400" />
        {trip.driver}
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <StatBadge
          icon={<Armchair size={13} />}
          value={trip.availableSeats}
          label="asientos"
          tone="green"
        />
        <StatBadge
          icon={<Users size={13} />}
          value={trip.standingSpots}
          label="de pie"
          tone="amber"
        />
      </div>

      <button
        onClick={onSelect}
        disabled={!hasSpace}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors mt-auto ${
          hasSpace
            ? 'bg-navy-900 text-white hover:bg-navy-800'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {hasSpace ? 'Seleccionar lugar' : 'Sin cupos'}
      </button>
    </div>
  );
}

function ActiveReservationCard({
  reservation,
  onCancel,
}: {
  reservation: ActiveReservation;
  onCancel: () => void;
}) {
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
          <span className="text-white/50 font-medium text-base">
            → {reservation.destination}
          </span>
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
            <p className="text-sm text-white/80">
              ¿Seguro que deseas cancelar esta reserva?
            </p>
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

function ReservationField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
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
        <span className="text-xs text-gray-400">
          {availableTrips.length} viajes
        </span>
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
          <p className="text-sm font-medium text-gray-500 mb-1">
            No hay viajes disponibles
          </p>
          <p className="text-sm">Vuelve más tarde para reservar tu lugar.</p>
        </div>
      )}
    </div>
  );
}
