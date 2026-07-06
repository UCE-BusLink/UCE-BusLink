import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus, CheckCircle, XCircle, Clock, MapPin, Eye, RefreshCw,
  Plus, X, Trash2, ChevronRight, Calendar
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRoutes } from '../../hooks/useRoutes';
import {
  createRoute, createBatchStops, previewRoute, createSchedule, fetchStops,
  type BatchStop, type ApiStop
} from '../../services/adminService';

// Importaciones de Leaflet para el mapeo interactivo
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución para corregir los íconos rotos por defecto de Leaflet en entornos modernos de bundling (Vite/Webpack)
//@ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const DAYS_OF_WEEK = [
  { id: 'MONDAY', label: 'Lunes' },
  { id: 'TUESDAY', label: 'Martes' },
  { id: 'WEDNESDAY', label: 'Miércoles' },
  { id: 'THURSDAY', label: 'Jueves' },
  { id: 'FRIDAY', label: 'Viernes' },
  { id: 'SATURDAY', label: 'Sábado' },
  { id: 'SUNDAY', label: 'Domingo' }
];

const EMPTY_FORM = { name: '', description: '', estimatedDurationMinutes: '' };

interface ScheduleGroup {
  daysOfWeek: string[];
  fixedDepartureTimes: string[];
}

interface OrderedStop {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Función auxiliar para decodificar la cadena Polyline devuelta por la API de Google Maps
function decodePolyline(encoded: string): [number, number][] {
  if (!encoded) return [];
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Componente interno para capturar clics en el mapa interactivo de Leaflet
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function AdminRoutesPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { routes, loading, error, refetch } = useRoutes();

  // Estados generales de control
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [showForm, setShowForm] = useState(false);
  const [previewRouteMap, setPreviewRouteMap] = useState<any | null>(null); // Guardará la ruta a previsualizar

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Estado Paso 1: Información Básica
  const [form, setForm] = useState(EMPTY_FORM);

  // Estado Paso 2: Paradas y Trazado
  const [newStops, setNewStops] = useState<OrderedStop[]>([]);
  const [tempStop, setTempStop] = useState({ name: '', latitude: '', longitude: '' });
  const [availableStops, setAvailableStops] = useState<ApiStop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [createdRouteId, setCreatedRouteId] = useState<string | null>(null);
  const [routePolylineRaw, setRoutePolylineRaw] = useState<string>('');

  // Estado Paso 3: Configuración Dinámica de Múltiples Horarios
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([]);
  const [currentGroupDays, setCurrentGroupDays] = useState<string[]>([]);
  const [currentGroupTimes, setCurrentGroupTimes] = useState<string[]>([]);
  const [tempTime, setTempTime] = useState('');

  // Centro inicial del mapa centrado en Quito por defecto (coordenadas UCE aproximadas)
  const MAP_CENTER_DEFAULT: [number, number] = [-0.1989, -78.5065];

  useEffect(() => {
    let cancelled = false;
    async function loadStops() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const stops = await fetchStops(token);
        if (!cancelled) setAvailableStops(stops);
      } catch {
        if (!cancelled) setAvailableStops([]);
      }
    }
    loadStops();
    return () => { cancelled = true; };
  }, [getToken]);

  function handleAddExistingStop() {
    const stop = availableStops.find((s) => s.id === selectedStopId);
    if (!stop || newStops.some((s) => s.id === stop.id)) return;
    setNewStops([...newStops, {
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
    }]);
    setSelectedStopId('');
  }

  function handleMapClick(lat: number, lng: number) {
    setTempStop(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6)
    }));
  }

  function closeForm() {
    setShowForm(false);
    setCurrentStep(1);
    setForm(EMPTY_FORM);
    setNewStops([]);
    setTempStop({ name: '', latitude: '', longitude: '' });
    setSelectedStopId('');
    setScheduleGroups([]);
    setCurrentGroupDays([]);
    setCurrentGroupTimes([]);
    setCreatedRouteId(null);
    setRoutePolylineRaw('');
    setSaveError(null);
  }

  function handleAddTempStop() {
    if (!tempStop.name || !tempStop.latitude || !tempStop.longitude) return;
    setNewStops([...newStops, { 
      name: tempStop.name, 
      latitude: parseFloat(tempStop.latitude), 
      longitude: parseFloat(tempStop.longitude) 
    }]);
    setTempStop({ name: '', latitude: '', longitude: '' });
  }

  function removeNewStop(index: number) {
    setNewStops(newStops.filter((_, i) => i !== index));
  }

  // Lógica para añadir un bloque de horarios al grupo principal
  function handleAddScheduleGroup() {
    if (currentGroupDays.length === 0 || currentGroupTimes.length === 0) {
      setSaveError('Por favor selecciona al menos un día y un horario para agregar el bloque de operación.');
      return;
    }
    setSaveError(null);
    setScheduleGroups([...scheduleGroups, {
      daysOfWeek: currentGroupDays,
      fixedDepartureTimes: [...currentGroupTimes].sort()
    }]);
    setCurrentGroupDays([]);
    setCurrentGroupTimes([]);
  }

  // --- TRANSICIONES Y LLAMADAS A LA API ---
  async function handleNextFromStep2() {
    if (newStops.length < 2) {
      setSaveError('Añade al menos 2 paradas para trazar una ruta.');
      return;
    }
    setSaveError(null);
    setSaving(true);
    
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No autorizado');

      const stopsToCreate: BatchStop[] = newStops
        .filter((s) => !s.id)
        .map((s) => ({ name: s.name, latitude: s.latitude, longitude: s.longitude }));

      const createdStops = stopsToCreate.length ? await createBatchStops(token, stopsToCreate) : [];

      let createdIndex = 0;
      const orderedStops = newStops.map((s) =>
        s.id ? s : { ...s, id: createdStops[createdIndex++].id as string }
      );

      const waypoints = orderedStops.map((s) => ({ stopId: s.id as string }));

      const previewResult = await previewRoute(token, waypoints);
      const polyline = previewResult.polyline || previewResult.encodedPolyline || '';
      setRoutePolylineRaw(polyline);

      const routePayload = {
        name: form.name,
        description: form.description,
        estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
        pathPolyline: polyline,
        stops: orderedStops.map((s, index) => ({
          stopId: s.id as string,
          stopOrder: index + 1,
          estimatedMinutesFromStart: index * 5,
          stopDurationMinutes: 1
        }))
      };

      const savedRoute = await createRoute(token, routePayload);
      if (!savedRoute || !savedRoute.id) throw new Error('No se recibió el ID de la ruta creada');
      
      setCreatedRouteId(savedRoute.id);
      setCurrentStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setSaveError(`Error al procesar las paradas y la ruta: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizeSchedule() {
    if (scheduleGroups.length === 0) {
      setSaveError('Debes estructurar al menos un bloque de horarios antes de finalizar.');
      return;
    }
    
    setSaving(true);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token || !createdRouteId) return;

      const schedulePayload = {
        routeId: createdRouteId,
        details: scheduleGroups.map(group => ({
          type: "FIXED",
          daysOfWeek: group.daysOfWeek,
          fixedDepartureTimes: group.fixedDepartureTimes,
          frequencyStartTime: null,
          frequencyEndTime: null,
          frequencyIntervalMinutes: null
        }))
      };

      await createSchedule(token, schedulePayload);
      closeForm();
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setSaveError(`No se pudieron almacenar los bloques de horarios: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div>
      {/* CABECERA PRINCIPAL */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Rutas</h1>
          <p className="text-gray-500 text-sm mt-1">{routes.length} rutas registradas en el sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Recargar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <Plus size={15} />
            Nueva ruta
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            id="route-search"
            name="search"
            type="text"
            placeholder="Buscar ruta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
          />
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No se encontraron rutas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Descripción</th>
                <th className="px-5 py-3">Duración</th>
                <th className="px-5 py-3">Paradas</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.map((route) => (
                <tr 
                  key={route.id} 
                  onClick={() => setPreviewRouteMap(route)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bus size={14} className="text-navy-700" />
                      </div>
                      <span className="text-sm font-semibold text-navy-900">{route.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-500 truncate max-w-[200px] block">
                      {route.description ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={13} className="text-amber-500" />
                      {route.estimatedDurationMinutes ? `${route.estimatedDurationMinutes} min` : '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={13} className="text-navy-500" />
                      {route.stops?.length ?? 0}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {route.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle size={12} /> Activa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                        <XCircle size={12} /> Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/routes/${route.id}`); }}
                      className="flex items-center gap-1.5 text-xs font-medium text-navy-700 hover:text-navy-900 transition-colors"
                    >
                      <Eye size={14} />
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-medium text-gray-500">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE PREVISUALIZACIÓN DE RUTA */}
      {previewRouteMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col h-[70vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white z-10">
              <div>
                <h2 className="font-bold text-lg text-navy-900">{previewRouteMap.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{previewRouteMap.stops?.length || 0} paradas en la ruta</p>
              </div>
              <button onClick={() => setPreviewRouteMap(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 w-full bg-gray-50 relative">
              <MapContainer
                bounds={previewRouteMap.stops && previewRouteMap.stops.length > 0 
                  ? previewRouteMap.stops.map((s: any) => [s.latitude, s.longitude] as [number, number])
                  : [MAP_CENTER_DEFAULT]}
                zoom={14}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                
                {previewRouteMap.pathPolyline && (
                  <Polyline 
                    positions={decodePolyline(previewRouteMap.pathPolyline)} 
                    color="#0f172a" 
                    weight={4} 
                    opacity={0.8}
                  />
                )}
                
                {previewRouteMap.stops?.map((stop: any, idx: number) => (
                  <Marker key={stop.id} position={[stop.latitude, stop.longitude]}>
                    <Popup>
                      <div className="text-sm font-bold text-navy-900">
                        {idx + 1}. {stop.name}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEL WIZARD DE CREACIÓN */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col">
            
            {/* Cabecera interna */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-navy-900">Crear Nueva Ruta</h2>
                <button onClick={closeForm}>
                  <X size={20} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center justify-between relative max-w-xl mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10"></div>
                {[
                  { step: 1, label: 'Información' },
                  { step: 2, label: 'Paradas y Geometría' },
                  { step: 3, label: 'Bloques Horarios' }
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center bg-white px-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      currentStep >= s.step ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {s.step}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${currentStep >= s.step ? 'text-navy-900' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contenido Modular del Wizard */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              
              {/* PASO 1: Información Básica */}
              {currentStep === 1 && (
                <div className="space-y-5 max-w-xl mx-auto animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre de la Ruta</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ej. Ruta Troncal Sur - Campus Central"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Descripción</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Indique detalles sobre recorridos o facultades cubiertas..."
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900/20 resize-none outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Duración estimada (minutos)</label>
                    <input
                      required
                      type="number"
                      value={form.estimatedDurationMinutes}
                      onChange={(e) => setForm({ ...form, estimatedDurationMinutes: e.target.value })}
                      placeholder="Ej. 35"
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy-900/20 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: Gestión de Paradas mediante Mapa Interactivo */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in duration-200">
                  
                  {/* Formulario y listado de paradas (Izquierda) */}
                  <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-800 leading-relaxed">
                        Añade una parada ya guardada o haz clic en el mapa de la derecha para crear una nueva.
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                        <label className="text-xs text-gray-500 block font-medium">Añadir parada guardada</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedStopId}
                            onChange={(e) => setSelectedStopId(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white"
                          >
                            <option value="">Selecciona una parada...</option>
                            {availableStops
                              .filter((s) => !newStops.some((ns) => ns.id === s.id))
                              .map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAddExistingStop}
                            disabled={!selectedStopId}
                            className="px-3 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-40 text-sm font-medium flex items-center justify-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-wide">
                        <div className="flex-1 h-px bg-gray-100" />
                        o crea una nueva
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1 font-medium">Nombre de la Parada</label>
                          <input 
                            type="text" value={tempStop.name} onChange={e => setTempStop({...tempStop, name: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-white" placeholder="Ej. Puerta Principal UCE"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1 font-medium">Latitud</label>
                            <input 
                              type="number" readOnly value={tempStop.latitude}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600" placeholder="Clic en el mapa"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1 font-medium">Longitud</label>
                            <input 
                              type="number" readOnly value={tempStop.longitude}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600" placeholder="Clic en el mapa"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={handleAddTempStop}
                          disabled={!tempStop.name || !tempStop.latitude}
                          className="w-full py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 disabled:opacity-40 font-medium text-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus size={16} /> Insertar Parada en Orden
                        </button>
                      </div>
                    </div>

                    {/* Lista secuencial de paradas ingresadas */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white max-h-[220px] overflow-y-auto flex-1 mt-2">
                      {newStops.length === 0 ? (
                        <p className="p-4 text-center text-sm text-gray-400">No se han registrado paradas en esta trayectoria.</p>
                      ) : (
                        newStops.map((stop, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-navy-900 truncate flex items-center gap-1.5">
                                {stop.name}
                                {stop.id && (
                                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    guardada
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate">Lat: {stop.latitude} | Lng: {stop.longitude}</p>
                            </div>
                            <button onClick={() => removeNewStop(i)} className="text-red-400 hover:text-red-600 p-1">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Mapa dinámico interactivo (Derecha) */}
                  <div className="lg:col-span-7 h-[350px] lg:h-full min-h-[350px] rounded-2xl overflow-hidden border border-gray-200 relative z-10">
                    <MapContainer center={MAP_CENTER_DEFAULT} zoom={15} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <MapClickHandler onMapClick={handleMapClick} />
                      
                      {/* Dibujar los marcadores ya establecidos en tiempo real */}
                      {newStops.map((stop, idx) => (
                        <Marker key={idx} position={[stop.latitude, stop.longitude]}>
                          <Popup>
                            <span className="font-semibold text-xs text-navy-900">#{idx + 1} {stop.name}</span>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              )}

              {/* PASO 3: Vista de Ruta Creada y Bloques de Horarios Asíncronos */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in duration-200">
                  
                  {/* Panel de Horarios Estructurados (Izquierda) */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-emerald-900">¡Geometría de Ruta Consolidada!</h4>
                        <p className="text-xs text-emerald-700 mt-0.5">El trazado ha sido calculado de forma óptima a través del callejero.</p>
                      </div>
                    </div>

                    {/* Generador modular de grupos de horarios */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
                      <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Configurar Bloque de Operación</h4>
                      
                      {/* Selector de días */}
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 uppercase">Días del bloque</label>
                        <div className="flex flex-wrap gap-1.5">
                          {DAYS_OF_WEEK.map(day => {
                            const isSelected = currentGroupDays.includes(day.id);
                            return (
                              <button
                                type="button" key={day.id}
                                onClick={() => {
                                  setCurrentGroupDays(prev => 
                                    isSelected ? prev.filter(d => d !== day.id) : [...prev, day.id]
                                  );
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                  isSelected 
                                    ? 'bg-navy-900 text-white border-navy-900 shadow-sm' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selector de horas */}
                      <div>
                        <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 uppercase">Horarios de salida (HH:MM:SS)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="time" step="1" value={tempTime}
                            onChange={(e) => setTempTime(e.target.value)}
                            className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-navy-900/20"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (tempTime && !currentGroupTimes.includes(tempTime)) {
                                setCurrentGroupTimes([...currentGroupTimes, tempTime].sort());
                                setTempTime('');
                              }
                            }}
                            className="px-3 py-1.5 bg-navy-100 text-navy-900 font-bold rounded-xl hover:bg-navy-200 text-xs transition-colors"
                          >
                            Agregar Hora
                          </button>
                        </div>
                        
                        {/* Tags de horas actuales */}
                        <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-lg border border-gray-100">
                          {currentGroupTimes.length === 0 && <span className="text-gray-400 text-xs italic">Ninguna hora añadida a este bloque</span>}
                          {currentGroupTimes.map(time => (
                            <div key={time} className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700">
                              <Clock size={12} className="text-gray-400" />
                              {time}
                              <button 
                                type="button" onClick={() => setCurrentGroupTimes(currentGroupTimes.filter(t => t !== time))}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button" onClick={handleAddScheduleGroup}
                        className="w-full py-2 bg-white text-navy-900 border border-navy-900/30 font-bold rounded-xl hover:bg-navy-50 text-xs transition-colors shadow-sm"
                      >
                        + Vincular Bloque de Horarios
                      </button>
                    </div>

                    {/* Bloques guardados en memoria interna listos para enviar */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bloques consolidados a guardar ({scheduleGroups.length})</p>
                      {scheduleGroups.length === 0 && <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">No hay estructuras horarias registradas todavía.</p>}
                      {scheduleGroups.map((group, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 shadow-sm rounded-xl text-xs animate-in slide-in-from-bottom-2">
                          <div className="space-y-1">
                            <p className="font-bold text-navy-900">
                              Días: {group.daysOfWeek.map(d => DAYS_OF_WEEK.find(day => day.id === d)?.label).join(', ')}
                            </p>
                            <p className="text-gray-500 font-medium">
                              Salidas: {group.fixedDepartureTimes.join(' | ')}
                            </p>
                          </div>
                          <button 
                            type="button" onClick={() => setScheduleGroups(scheduleGroups.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Renderizador de Mapa con la Ruta Polilinea decodificada (Derecha) */}
                  <div className="lg:col-span-6 h-[300px] lg:h-full min-h-[300px] rounded-2xl overflow-hidden border border-gray-200 relative z-10">
                    <MapContainer 
                      center={newStops[0] ? [newStops[0].latitude, newStops[0].longitude] : MAP_CENTER_DEFAULT} 
                      zoom={14} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      
                      {/* Marcadores de paradas fijas */}
                      {newStops.map((stop, idx) => (
                        <Marker key={idx} position={[stop.latitude, stop.longitude]}>
                          <Popup>
                            <span className="font-semibold text-xs text-navy-900">#{idx + 1} - {stop.name}</span>
                          </Popup>
                        </Marker>
                      ))}

                      {/* Dibujo de la Polilínea real generada por el backend */}
                      {routePolylineRaw && (
                        <Polyline 
                          positions={decodePolyline(routePolylineRaw)} 
                          color="#1e3a8a" 
                          weight={5} 
                          opacity={0.8} 
                        />
                      )}
                    </MapContainer>
                  </div>
                </div>
              )}
              
              {saveError && <p className="mt-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{saveError}</p>}
            </div>

            {/* Footer de Controles */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
              {currentStep > 1 && currentStep < 3 ? (
                <button
                  type="button" onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors"
                >
                  Anterior
                </button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-2">
                <button
                  type="button" onClick={closeForm}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>

                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (form.name && form.estimatedDurationMinutes) setCurrentStep(2);
                      else setSaveError('Completa los campos obligatorios antes de proceder.');
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    type="button" onClick={handleNextFromStep2}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Procesando Trazado...' : 'Guardar y Continuar'} <ChevronRight size={16} />
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    type="button" onClick={handleFinalizeSchedule}
                    disabled={saving || scheduleGroups.length === 0}
                    className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Calendar size={16} />
                    {saving ? 'Guardando Estructuras...' : 'Finalizar Configuración'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}