import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Flag,
  Route as RouteIcon,
  Clock,
  Ruler,
  Bus,
} from 'lucide-react';
import { routes } from '../data/mockData';
import type { Route, RouteStop, StopType } from '../types';

const STOP_DOT: Record<StopType, string> = {
  origin: 'bg-green-500 ring-green-100',
  stop: 'bg-navy-700 ring-navy-100',
  destination: 'bg-amber-500 ring-amber-100',
};

function StopIcon({ type }: { type: StopType }) {
  if (type === 'origin') return <Navigation size={13} className="text-white" />;
  if (type === 'destination') return <Flag size={13} className="text-white" />;
  return <MapPin size={11} className="text-white" />;
}

function StopRow({ stop, isLast }: { stop: RouteStop; isLast: boolean }) {
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
          <StopIcon type={stop.type} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>
      <div className={isLast ? '' : 'pb-6'}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-navy-900">{stop.name}</p>
      </div>
    </div>
  );
}

function RouteMapPreview({ route }: { route: Route }) {
  // Representación estilizada del recorrido (placeholder hasta integrar mapa real)
  return (
    <div className="relative h-full min-h-[320px] rounded-xl overflow-hidden bg-navy-950">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <svg
        viewBox="0 0 400 320"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
      >
        <polyline
          points="60,270 140,210 200,230 270,130 340,70"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
      </svg>
      <div className="absolute left-[15%] top-[84%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-green-500 ring-4 ring-green-500/20 flex items-center justify-center">
          <Navigation size={13} className="text-white" />
        </div>
      </div>
      <div className="absolute left-[85%] top-[22%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-7 h-7 rounded-full bg-amber-500 ring-4 ring-amber-500/20 flex items-center justify-center">
          <Flag size={13} className="text-white" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
        <p className="text-xs text-white/50">Recorrido aproximado</p>
        <p className="text-sm font-semibold text-white">
          {route.stops[0]?.name} → {route.destination}
        </p>
      </div>
    </div>
  );
}

export function MapPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(routes[0]?.id ?? '');
  const selected = routes.find((r) => r.id === selectedId) ?? routes[0];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Mapa de rutas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visualiza el recorrido y las paradas de cada ruta nocturna.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {routes.map((route) => (
          <button
            key={route.id}
            onClick={() => setSelectedId(route.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              selectedId === route.id
                ? 'bg-navy-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <RouteIcon size={15} />
            {route.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              <RouteMapPreview route={selected} />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <MetaCard
                icon={<Ruler size={16} className="text-navy-700" />}
                label="Distancia"
                value={`${selected.distanceKm} km`}
              />
              <MetaCard
                icon={<MapPin size={16} className="text-navy-700" />}
                label="Paradas"
                value={`${selected.stops.length}`}
              />
              <MetaCard
                icon={<Clock size={16} className="text-navy-700" />}
                label="Salidas"
                value={`${selected.departureTimes.length}`}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-navy-900">
                Paradas de la ruta
              </h2>
              <span className="text-xs text-gray-400">{selected.stops.length}</span>
            </div>

            <div>
              {selected.stops.map((stop, i) => (
                <StopRow
                  key={`${stop.name}-${i}`}
                  stop={stop}
                  isLast={i === selected.stops.length - 1}
                />
              ))}
            </div>

            <button
              onClick={() => navigate(`/routes/${selected.id}`)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <Bus size={15} />
              Ver viajes de esta ruta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-base font-bold text-navy-900">{value}</p>
      </div>
    </div>
  );
}
