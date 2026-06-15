import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Bus, AlertCircle, CalendarOff } from 'lucide-react';
import { getCurrentWeekDays } from '../data/mockData';
import { useRoute } from '../hooks/useRoute';

export function RouteDetailPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();

  const weekDays = getCurrentWeekDays();
  const todayIndex = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    todayIndex >= 0 ? todayIndex : 0
  );

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
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarOff size={28} className="opacity-40" />
            </div>
            <p className="font-semibold text-gray-500 mb-1">No hay viajes programados</p>
            <p className="text-sm">
              Aún no existen viajes para esta ruta en la fecha seleccionada.
            </p>
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
            <p className="text-sm text-gray-600 leading-relaxed">
              {route.description ?? 'Esta ruta no tiene una descripción registrada.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
