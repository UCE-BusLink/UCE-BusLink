import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Flag,
  Route as RouteIcon,
  Clock,
  MapPin,
  Bus,
  Loader2,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRoutes } from '../hooks/useRoutes';
import { useRoute } from '../hooks/useRoute';
import type { ApiRouteStop } from '../types';

const UCE_CENTER: [number, number] = [-0.2298, -78.5249];

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

type StopType = 'origin' | 'stop' | 'destination';

function deriveStopType(index: number, total: number): StopType {
  if (index === 0) return 'origin';
  if (index === total - 1) return 'destination';
  return 'stop';
}

function makeStopIcon(type: StopType) {
  const colors = { origin: '#22c55e', stop: '#1e3a5f', destination: '#f59e0b' };
  const c = colors[type];
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${c};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4),0 0 0 2px ${c}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function StopRow({ stop, type, isLast }: { stop: ApiRouteStop; type: StopType; isLast: boolean }) {
  const label = type === 'origin' ? 'Origen' : type === 'destination' ? 'Destino' : 'Parada';
  const dotClass: Record<StopType, string> = {
    origin: 'bg-green-500 ring-green-100',
    stop: 'bg-navy-700 ring-navy-100',
    destination: 'bg-amber-500 ring-amber-100',
  };
  const Icon = type === 'origin' ? Navigation : type === 'destination' ? Flag : MapPin;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ring-4 ${dotClass[type]}`}>
          <Icon size={type === 'stop' ? 11 : 13} className="text-white" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </div>
      <div className={isLast ? '' : 'pb-6'}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-navy-900">{stop.stopName}</p>
        {stop.estimatedMinutesFromStart !== null && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock size={10} />
            {stop.estimatedMinutesFromStart} min desde inicio
          </p>
        )}
      </div>
    </div>
  );
}

function MetaCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

export function MapPage() {
  const navigate = useNavigate();
  const { routes, loading: routesLoading } = useRoutes();
  const [selectedId, setSelectedId] = useState<string>('');
  const { route: selectedRoute, loading: routeLoading } = useRoute(selectedId);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (routes.length > 0 && !selectedId) {
      setSelectedId(routes[0].id);
    }
  }, [routes, selectedId]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView(UCE_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstance.current);
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    if (!selectedRoute?.stops?.length) return;

    const sorted = [...selectedRoute.stops].sort((a, b) => a.stopOrder - b.stopOrder);
    const valid = sorted.filter((s) => s.latitude !== 0 || s.longitude !== 0);
    if (valid.length === 0) return;

    valid.forEach((stop, i) => {
      const type = deriveStopType(i, valid.length);
      const marker = L.marker([stop.latitude, stop.longitude], { icon: makeStopIcon(type) })
        .bindPopup(`<strong>${stop.stopName}</strong>`)
        .addTo(map);
      layersRef.current.push(marker);
    });

    if (selectedRoute.pathPolyline) {
      const pts = decodePolyline(selectedRoute.pathPolyline);
      const poly = L.polyline(pts, { color: '#f59e0b', weight: 4, dashArray: '6 10' }).addTo(map);
      layersRef.current.push(poly);
      map.fitBounds(poly.getBounds(), { padding: [20, 20] });
    } else {
      const bounds = L.latLngBounds(valid.map((s) => [s.latitude, s.longitude] as [number, number]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [selectedRoute]);

  const sortedStops = selectedRoute?.stops
    ? [...selectedRoute.stops].sort((a, b) => a.stopOrder - b.stopOrder)
    : [];

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-navy-900">Mapa de rutas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visualiza el recorrido y las paradas de cada ruta nocturna.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {routesLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={15} className="animate-spin" />
            Cargando rutas...
          </div>
        ) : (
          routes.map((route) => (
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
          ))
        )}
      </div>

      {selectedId && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 relative">
              {routeLoading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 rounded-2xl">
                  <Loader2 size={24} className="animate-spin text-navy-700" />
                </div>
              )}
              <div ref={mapRef} className="h-[320px] rounded-xl overflow-hidden" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <MetaCard
                icon={<Clock size={16} className="text-navy-700" />}
                label="Duración est."
                value={
                  selectedRoute?.estimatedDurationMinutes
                    ? `${selectedRoute.estimatedDurationMinutes} min`
                    : '--'
                }
              />
              <MetaCard
                icon={<MapPin size={16} className="text-navy-700" />}
                label="Paradas"
                value={`${sortedStops.length}`}
              />
              <MetaCard
                icon={<Bus size={16} className="text-navy-700" />}
                label="Estado"
                value={selectedRoute?.isActive ? 'Activa' : selectedRoute ? 'Inactiva' : '--'}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-navy-900">Paradas de la ruta</h2>
              <span className="text-xs text-gray-400">{sortedStops.length}</span>
            </div>

            {sortedStops.length > 0 ? (
              <div>
                {sortedStops.map((stop, i) => (
                  <StopRow
                    key={stop.stopId}
                    stop={stop}
                    type={deriveStopType(i, sortedStops.length)}
                    isLast={i === sortedStops.length - 1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                {routeLoading ? 'Cargando paradas...' : 'Sin paradas registradas'}
              </p>
            )}

            <button
              onClick={() => navigate(`/routes/${selectedId}`)}
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
