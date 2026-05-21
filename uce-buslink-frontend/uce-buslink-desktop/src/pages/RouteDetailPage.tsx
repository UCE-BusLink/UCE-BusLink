import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Armchair, CheckCircle, ChevronLeft } from 'lucide-react';
import {
  getRouteById,
  getTripsByRoute,
  getCurrentWeekDays,
} from '../data/mockData';
import type { Trip } from '../types';

function TripCard({
  trip,
  onReserve,
  onReserveStanding,
}: {
  trip: Trip;
  onReserve: () => void;
  onReserveStanding: () => void;
}) {
  const isUnavailable = trip.status === 'unavailable';

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm ${
        isUnavailable ? 'border-gray-100 opacity-60' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 flex-1">
          <span
            className={`text-3xl font-bold tabular-nums flex-shrink-0 ${
              isUnavailable ? 'text-gray-400' : 'text-navy-900'
            }`}
          >
            {trip.time}
          </span>

          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
              <User size={14} />
              <span>Driver: {trip.driver}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {isUnavailable ? (
                <span className="text-xs text-gray-400 font-medium">Agotado</span>
              ) : (
                <>
                  {trip.availableSeats > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                      <Armchair size={11} />
                      {trip.availableSeats} asientos
                    </span>
                  )}
                  {trip.standingSpots > 0 && (
                    <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                      <User size={11} />
                      {trip.standingSpots} de pie
                    </span>
                  )}
                </>
              )}
            </div>
            {!isUnavailable && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <CheckCircle size={12} />
                <span>Confirmado</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {isUnavailable ? (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              No disponible
            </button>
          ) : trip.availableSeats > 0 ? (
            <button
              onClick={onReserve}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
            >
              Reservar
            </button>
          ) : (
            <button
              onClick={onReserveStanding}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              <User size={14} />
              Reservar de pie
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();

  const weekDays = getCurrentWeekDays();
  const todayIndex = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    todayIndex >= 0 ? todayIndex : 0
  );

  const route = getRouteById(routeId ?? '');
  const trips = getTripsByRoute(routeId ?? '');

  if (!route) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Ruta no encontrada.</p>
        <button
          onClick={() => navigate('/routes')}
          className="text-sm text-navy-900 font-semibold hover:underline"
        >
          Volver a rutas
        </button>
      </div>
    );
  }

  function handleNavigateToSeats(tripId: string) {
    navigate(`/routes/${routeId}/seats/${tripId}`);
  }

  return (
    <div>
      <button
        onClick={() => navigate('/routes')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors mb-5"
      >
        <ChevronLeft size={16} />
        Rutas disponibles
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-1">
          {weekDays.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl transition-colors flex-1 ${
                selectedDayIndex === index
                  ? 'bg-navy-900 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-medium">{day.label}</span>
              <span className="text-sm font-bold mt-0.5">{day.day}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onReserve={() => handleNavigateToSeats(trip.id)}
              onReserveStanding={() => handleNavigateToSeats(trip.id)}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="bg-navy-900 h-36 flex items-center justify-center">
            <span className="text-white/20 text-sm select-none">Vista de ruta</span>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-navy-900">{route.name}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                {route.distanceKm} km
              </span>
            </div>
            <div className="space-y-1">
              {route.stops.map((stop, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-1 flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        stop.type === 'origin' || stop.type === 'destination'
                          ? 'bg-navy-900 border-navy-900'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                    {index < route.stops.length - 1 && (
                      <div className="w-px h-5 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className="text-sm font-medium text-navy-900">{stop.name}</p>
                    {stop.type === 'origin' && (
                      <p className="text-xs text-gray-400">Origen</p>
                    )}
                    {stop.type === 'destination' && (
                      <p className="text-xs text-gray-400">Destino Final</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
