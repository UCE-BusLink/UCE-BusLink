import { useEffect, useRef, useState } from 'react';
import { Loader2, LocateFixed } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ApiRoute } from '../../types';
import { UCE_CENTER, decodePolyline, deriveStopType, makeStopIcon } from '../../utils/mapUtils';

interface LiveBusMarker {
  latitude: number;
  longitude: number;
  velocity?: number;
  etaMinutes?: number;
  nextStopName?: string;
}

interface LeafletMapProps {
  selectedRoute: ApiRoute | null;
  loading: boolean;
  liveBus?: LiveBusMarker | null;
  liveBusTitle?: string;
  showLocateButton?: boolean;
  selectedStopId?: string | null;
  onStopSelect?: (stopId: string) => void;
}

const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px rgba(37,99,235,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const busIcon = L.divIcon({
  className: 'live-bus-icon',
  html: `
    <div style="background-color:#1e3a8a;color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.35);">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

export function LeafletMap({
  selectedRoute,
  loading,
  liveBus,
  liveBusTitle,
  showLocateButton,
  selectedStopId,
  onStopSelect,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    const map = mapInstance.current;
    if (!map || !('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        if (!userMarkerRef.current) {
          userMarkerRef.current = L.marker(point, { icon: userIcon }).addTo(map);
        } else {
          userMarkerRef.current.setLatLng(point);
        }
        userMarkerRef.current.bindPopup('Estás aquí');
        map.setView(point, Math.max(map.getZoom(), 15));
        setLocating(false);
      },
      (error) => {
        console.error('[MAP] Error de geolocalización:', error.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
      const isSelected = selectedStopId === stop.stopId;
      const marker = L.marker([stop.latitude, stop.longitude], { icon: makeStopIcon(type, isSelected) })
        .bindPopup(`<strong>${stop.stopName}</strong>`)
        .addTo(map);
      
      if (onStopSelect) {
        marker.on('click', () => {
          onStopSelect(stop.stopId);
        });
      }
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
  }, [selectedRoute, selectedStopId, onStopSelect]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (!liveBus) {
      if (busMarkerRef.current) {
        map.removeLayer(busMarkerRef.current);
        busMarkerRef.current = null;
      }
      return;
    }

    const position: [number, number] = [liveBus.latitude, liveBus.longitude];
    const rows = [
      liveBus.nextStopName ? `Próxima parada: ${liveBus.nextStopName}` : '',
      liveBus.etaMinutes != null ? `Llega en: ${liveBus.etaMinutes} min` : '',
      liveBus.velocity != null ? `Velocidad: ${Math.round(liveBus.velocity)} km/h` : '',
    ].filter(Boolean).join('<br/>');
    const popupHtml = `
      <div style="min-width:150px">
        <strong>${liveBusTitle ?? 'Bus en camino'}</strong>${rows ? `<br/>${rows}` : ''}
      </div>
    `;

    if (!busMarkerRef.current) {
      busMarkerRef.current = L.marker(position, { icon: busIcon }).addTo(map);
      map.setView(position, Math.max(map.getZoom(), 15));
    } else {
      busMarkerRef.current.setLatLng(position);
    }
    busMarkerRef.current.bindPopup(popupHtml);
  }, [liveBus, liveBusTitle]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 relative z-0">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 rounded-2xl">
          <Loader2 size={24} className="animate-spin text-navy-700" />
        </div>
      )}
      <div ref={mapRef} className="h-[320px] rounded-xl overflow-hidden" />

      {showLocateButton && (
        <button
          type="button"
          onClick={handleLocate}
          title="Ver mi ubicación"
          className="absolute bottom-10 right-6 z-[1000] w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-navy-700 hover:bg-gray-50 transition-colors"
        >
          {locating ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <LocateFixed size={18} />
          )}
        </button>
      )}
    </div>
  );
}
