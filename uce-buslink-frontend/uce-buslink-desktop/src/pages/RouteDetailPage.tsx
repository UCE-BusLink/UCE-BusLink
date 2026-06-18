import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  Bus,
  AlertCircle,
  MapPin,
  Navigation,
  Flag,
  Star,
  Map as MapIcon,
} from 'lucide-react';
import { getCurrentWeekDays } from '../data/mockData';
import { useRoute } from '../hooks/useRoute';
import type { RouteStopDetail, StopType } from '../types';

const STOP_DOT: Record<StopType, string> = {
  origin: 'bg-green-500 ring-green-100',
  stop: 'bg-navy-700 ring-navy-100',
  destination: 'bg-amber-500 ring-amber-100',
};

function StopDotIcon({ type }: { type: StopType }) {
  if (type === 'origin') return <Navigation size={13} className="text-white" />;
  if (type === 'destination') return <Flag size={13} className="text-white" />;
  return <MapPin size={11} className="text-white" />;
}

function StopRow({ stop, isLast }: { stop: RouteStopDetail; isLast: boolean }) {
  const label =
    stop.type === 'origin'
      ? 'Origen'
      : stop.type === 'destination'
      ? 'Destino'
      : 'Parada';

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ring-4 ${STOP_DOT[stop.type]}`}
        >
          <StopDotIcon type={stop.type} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>
      <div className={isLast ? '' : 'pb-6'}>
        <p className="text-xs text-gray-400">
          {stop.order}. {label}
        </p>
        <p className="text-sm font-semibold text-navy-900">{stop.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <MapPin size={11} />
          {stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}
        </p>
      </div>
    </div>
  );
}

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');

  const weekDays = getCurrentWeekDays();
  const todayIndex = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    todayIndex >= 0 ? todayIndex : 0
  );

  // HU-244 — favorito local (persistencia pendiente del backend de favoritos)
  const [isFavorite, setIsFavorite] = useState(false);

  const { route, loading, error, notFound } = useRoute(routeId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-6" />
        <div className="h-20 bg-gray-100 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-40 bg-gray-100 rounded-2xl" />
          <div className="h-56 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !route) {
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

  if (error) {
    return (
      <div className="text-center py-24">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="font-semibold text-gray-700 mb-1">No se pudo cargar la ruta</p>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => navigate('/routes')}
          className="text-sm text-navy-900 font-semibold hover:underline"
        >
          Volver a rutas
        </button>
      </div>
    );
  }

  const stops: RouteStopDetail[] = (route.stops ?? [])
    .sort((a, b) => a.stopOrder - b.stopOrder)
    .map((s, i, arr) => ({
      order: s.stopOrder,
      name: s.stopName,
      type: (i === 0 ? 'origin' : i === arr.length - 1 ? 'destination' : 'stop') as StopType,
      lat: s.latitude,
      lng: s.longitude,
    }));

  const departureTimes: string[] = [];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(isAdminContext ? '/admin/routes' : '/routes')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ChevronLeft size={16} />
          {isAdminContext ? 'Gestión de rutas' : 'Rutas disponibles'}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFavorite((v) => !v)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors border ${
              isFavorite
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Star size={16} className={isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
            {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
          </button>

          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
          >
            <MapIcon size={16} />
            Ver en mapa
          </button>
        </div>
      </div>

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
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-navy-900 mb-4">
              Próximas salidas
            </h2>
            {departureTimes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {departureTimes.map((time) => (
                  <span
                    key={time}
                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 text-sm font-semibold text-navy-900"
                  >
                    <Clock size={14} className="text-amber-500" />
                    {time}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                No hay salidas programadas para esta fecha.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-navy-900">
                Paradas de la ruta
              </h2>
              <span className="text-xs text-gray-400">{stops.length} paradas</span>
            </div>
            <div>
              {stops.map((stop, i) => (
                <StopRow
                  key={`${stop.order}-${stop.name}`}
                  stop={stop}
                  isLast={i === stops.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="bg-navy-900 px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-bold text-white">{route.name}</h3>
              <span className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 flex items-center gap-1">
                <Bus size={11} />
                {route.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            {route.estimatedDurationMinutes !== null && (
              <p className="text-white/50 text-xs flex items-center gap-1">
                <Clock size={11} />
                {route.estimatedDurationMinutes} min aprox.
              </p>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Descripción
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              {route.description ?? 'Esta ruta no tiene una descripción registrada.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">Paradas</span>
              <span className="text-sm font-semibold text-navy-900">{stops.length}</span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-gray-400">Salidas diarias</span>
              <span className="text-sm font-semibold text-navy-900">
                {departureTimes.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
