import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Armchair,
  User,
} from 'lucide-react';
import { routes } from '../data/mockData';
import type { Route, RouteDirection } from '../types';

function DirectionIcon({ direction }: { direction: RouteDirection }) {
  const iconMap = {
    north: ArrowUp,
    south: ArrowDown,
    valley: ArrowRight,
  };
  const Icon = iconMap[direction];
  return (
    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-gray-600" />
    </div>
  );
}

function RouteCard({
  route,
  onViewTrips,
}: {
  route: Route;
  onViewTrips: () => void;
}) {
  const hasSeats = route.availableSeats > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <h3 className="text-lg font-bold text-navy-900 leading-tight">
          {route.name} – {route.destination}
        </h3>
        <DirectionIcon direction={route.direction} />
      </div>

      <div className="flex items-stretch gap-3 mb-5">
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400 flex-shrink-0" />
          <div className="w-px flex-1 bg-gray-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-navy-900 flex-shrink-0" />
        </div>
        <div className="flex flex-col justify-between">
          <span className="text-sm text-gray-500">{route.stops[0].name}</span>
          <span className="text-sm font-semibold text-navy-900">
            {route.stops[route.stops.length - 1].name}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Horarios de salida
        </p>
        <div className="flex gap-2 flex-wrap">
          {route.departureTimes.map((time) => (
            <span
              key={time}
              className="text-sm text-navy-900 border border-gray-200 rounded-lg px-3 py-1 font-medium"
            >
              {time}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium">
          <Armchair size={13} />
          <span>{route.availableSeats} Asientos</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium">
          <User size={13} />
          <span>{route.standingSpots} De pie</span>
        </div>
      </div>

      <button
        onClick={onViewTrips}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors mt-auto ${
          hasSeats
            ? 'bg-navy-900 text-white hover:bg-navy-800'
            : 'bg-amber-500 text-white hover:bg-amber-600'
        }`}
      >
        Ver viajes
      </button>
    </div>
  );
}

export function RoutesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Rutas disponibles</h1>
          <p className="text-gray-500 text-sm mt-1">
            Consulta los trayectos nocturnos y asegura tu lugar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ruta..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 w-52 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={16} />
            Filtrar por horario
          </button>
        </div>
      </div>

      {filteredRoutes.length > 0 ? (
        <div className="grid grid-cols-3 gap-5">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onViewTrips={() => navigate(`/routes/${route.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No se encontraron rutas para "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
