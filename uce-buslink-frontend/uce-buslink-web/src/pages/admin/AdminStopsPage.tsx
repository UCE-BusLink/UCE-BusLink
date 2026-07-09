import { useState, useEffect, useMemo } from 'react';
import { MapPin, RefreshCw, CheckCircle, XCircle, Plus, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchStops, createStop, updateStop, deleteStop, toggleStopStatus, type ApiStop,
} from '../../services/adminService';
import { useRoutes } from '../../hooks/useRoutes';
import { stopFormSchema } from '../../schemas/stop.schema';
import { getFieldErrors } from '../../schemas/common';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

//@ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recolorea el mismo ícono empaquetado en vez de depender de un marcador rojo servido desde un CDN externo.
const SelectedIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: 'marker-selected-red',
});

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const MAP_CENTER: [number, number] = [-0.1989, -78.5065];

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function FlyToStop({ stop }: { stop: ApiStop | null }) {
  const map = useMap();
  useEffect(() => {
    if (stop) {
      map.flyTo([stop.latitude, stop.longitude], 16, { animate: true, duration: 1.5 });
    }
  }, [stop, map]);
  return null;
}

export function AdminStopsPage() {
  const { getToken } = useAuth();
  const { routes } = useRoutes();

  const [stops, setStops] = useState<ApiStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Interacción mapa
  const [activeStop, setActiveStop] = useState<ApiStop | null>(null);

  const [trigger, setTrigger] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApiStop | null>(null);
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        const data = await fetchStops(token);
        setStops(data);
        setError(null);
      } catch {
        setError('No se pudieron cargar las paradas');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken, trigger]);

  function refresh() {
    setLoading(true);
    setTrigger((t) => t + 1);
  }

  function openCreate() {
    setEditing(null);
    setFormName('');
    setFormLat('');
    setFormLng('');
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  }

  function openEdit(stop: ApiStop) {
    setEditing(stop);
    setFormName(stop.name);
    setFormLat(String(stop.latitude));
    setFormLng(String(stop.longitude));
    setFormError(null);
    setFieldErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setFormError(null);
    setFieldErrors({});
  }

  async function handleSave() {
    setFormError(null);
    const result = stopFormSchema.safeParse({ name: formName, latitude: formLat, longitude: formLng });
    if (!result.success) {
      setFieldErrors(getFieldErrors(result.error));
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No autorizado');
      if (editing) {
        await updateStop(token, editing.id, result.data);
      } else {
        await createStop(token, result.data);
      }
      closeModal();
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(stop: ApiStop) {
    if (!window.confirm(`¿Eliminar la parada "${stop.name}"?`)) return;
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      await deleteStop(token, stop.id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  async function handleToggle(stop: ApiStop) {
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      await toggleStopStatus(token, stop.id, !stop.isActive);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  }

  // Filtrado
  const filtered = useMemo(() => {
    return stops.filter((s) => {
      if (statusFilter === 'ACTIVE' && !s.isActive) return false;
      if (statusFilter === 'INACTIVE' && s.isActive) return false;
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [stops, search, statusFilter]);

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const markerPos: [number, number] | null =
    formLat && formLng ? [parseFloat(formLat), parseFloat(formLng)] : null;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Paradas del Sistema</h1>
          <p className="text-gray-500 text-sm mt-1">{stops.length} paradas registradas en total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={15} />
            Recargar
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nueva parada
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        
        {/* COLUMNA IZQUIERDA: LISTA Y FILTROS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Buscar parada..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-white"
            >
              <option value="ALL">Todos los estados</option>
              <option value="ACTIVE">Activas</option>
              <option value="INACTIVE">Inactivas</option>
            </select>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400 text-sm">{error}</div>
            ) : currentItems.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No se encontraron paradas con estos filtros.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                      <th className="px-5 py-3">Nombre</th>
                      <th className="px-5 py-3 hidden sm:table-cell">Coordenadas</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentItems.map((stop) => (
                      <tr 
                        key={stop.id} 
                        onClick={() => setActiveStop(stop)}
                        className={`transition-colors cursor-pointer ${activeStop?.id === stop.id ? 'bg-navy-50/50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeStop?.id === stop.id ? 'bg-navy-900 text-white' : 'bg-green-50 text-green-600'}`}>
                              <MapPin size={14} />
                            </div>
                            <span className="text-sm font-semibold text-navy-900">{stop.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500 font-mono hidden sm:table-cell">
                          {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={(e) => { e.stopPropagation(); handleToggle(stop); }}>
                            {stop.isActive ? (
                              <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full hover:bg-green-100 transition-colors">
                                <CheckCircle size={12} /> Activa
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full hover:bg-gray-200 transition-colors">
                                <XCircle size={12} /> Inactiva
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(stop); }}
                              className="text-navy-700 hover:text-navy-900 transition-colors p-1.5 rounded-lg hover:bg-navy-50"
                              title="Editar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(stop); }}
                              className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
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
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: MAPA */}
        <div className="lg:col-span-5 h-[400px] lg:h-[600px] rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative z-10">
          <MapContainer
            center={activeStop ? [activeStop.latitude, activeStop.longitude] : MAP_CENTER}
            zoom={activeStop ? 16 : 13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <FlyToStop stop={activeStop} />
            
            {stops.filter(s => s.isActive).map(stop => {
              // Buscar rutas asociadas a esta parada
              const relatedRoutes = routes.filter(r => r.stops?.some(rs => rs.stopId === stop.id));
              const isSelected = activeStop?.id === stop.id;

              return (
                <Marker 
                  key={stop.id} 
                  position={[stop.latitude, stop.longitude]}
                  icon={isSelected ? SelectedIcon : DefaultIcon}
                  eventHandlers={{
                    click: () => setActiveStop(stop),
                  }}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <h3 className="font-bold text-sm text-navy-900 mb-1">{stop.name}</h3>
                      <div className="text-[11px] text-gray-500 mb-2 border-b border-gray-100 pb-2">
                        {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}
                      </div>
                      
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rutas que pasan por aquí:</p>
                      {relatedRoutes.length === 0 ? (
                        <p className="text-xs italic text-gray-400">Ninguna ruta asignada.</p>
                      ) : (
                        <ul className="space-y-1 max-h-[100px] overflow-y-auto">
                          {relatedRoutes.map(rr => (
                            <li key={rr.id} className="text-xs font-semibold text-navy-700 bg-navy-50 px-2 py-1 rounded truncate">
                              • {rr.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-navy-900">
                {editing ? 'Editar Parada' : 'Nueva Parada'}
              </h2>
              <button onClick={closeModal}>
                <X size={20} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-800">
                  Haz clic en el mapa para fijar las coordenadas automáticamente.
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Puerta Principal UCE"
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-navy-900/20"
                  />
                  {fieldErrors.name && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Latitud
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={formLat}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                      placeholder="Clic en mapa"
                    />
                    {fieldErrors.latitude && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.latitude}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Longitud
                    </label>
                    <input
                      type="number"
                      readOnly
                      value={formLng}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                      placeholder="Clic en mapa"
                    />
                    {fieldErrors.longitude && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.longitude}</p>}
                  </div>
                </div>
                {formError && (
                  <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                    {formError}
                  </p>
                )}
              </div>

              <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-10">
                <MapContainer
                  center={markerPos ?? MAP_CENTER}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <MapClickHandler
                    onMapClick={(lat, lng) => {
                      setFormLat(lat.toFixed(6));
                      setFormLng(lng.toFixed(6));
                    }}
                  />
                  {markerPos && <Marker position={markerPos} />}
                </MapContainer>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Parada'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
