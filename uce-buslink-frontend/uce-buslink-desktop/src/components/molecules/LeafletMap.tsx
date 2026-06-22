import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ApiRoute } from '../../types';
import { UCE_CENTER, decodePolyline, deriveStopType, makeStopIcon } from '../../utils/mapUtils';

interface LeafletMapProps {
  selectedRoute: ApiRoute | null;
  loading: boolean;
}

export function LeafletMap({ selectedRoute, loading }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 relative">
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 rounded-2xl">
          <Loader2 size={24} className="animate-spin text-navy-700" />
        </div>
      )}
      <div ref={mapRef} className="h-[320px] rounded-xl overflow-hidden" />
    </div>
  );
}
