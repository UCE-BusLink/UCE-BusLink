import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, CheckCircle, XCircle, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchStops, createStop, updateStop, deleteStop, toggleStopStatus, type ApiStop,
} from '../../services/adminService';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//@ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MAP_CENTER: [number, number] = [-0.1989, -78.5065];

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export function AdminStopsPage() {
  const { getToken } = useAuth();
  const [stops, setStops] = useState<ApiStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [trigger, setTrigger] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApiStop | null>(null);
  const [formName, setFormName] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        setStops(await fetchStops(token));
        setError(null);
      } catch {
        setError('No se pudieron cargar las paradas');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trigger]);

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
    setShowModal(true);
  }

  function openEdit(stop: ApiStop) {
    setEditing(stop);
    setFormName(stop.name);
    setFormLat(String(stop.latitude));
    setFormLng(String(stop.longitude));
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setFormError(null);
  }

  async function handleSave() {
    if (!formName || !formLat || !formLng) {
      setFormError('Completa todos los campos.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No autorizado');
      const payload = { name: formName, latitude: parseFloat(formLat), longitude: parseFloat(formLng) };
      if (editing) {
        await updateStop(token, editing.id, payload);
      } else {
        await createStop(token, payload);
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

  const filtered = stops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const markerPos: [number, number] | null =
    formLat && formLng ? [parseFloat(formLat), parseFloat(formLng)] : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Paradas</h1>
          <p className="text-gray-500 text-sm mt-1">{stops.length} paradas registradas</p>
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <Plus size={15} />
            Nueva parada
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar parada..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
          />
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No se encontraron paradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Latitud</th>
                  <th className="px-5 py-3">Longitud</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((stop) => (
                  <tr key={stop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                          <MapPin size={13} className="text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-navy-900">{stop.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-mono">{stop.latitude.toFixed(5)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 font-mono">{stop.longitude.toFixed(5)}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleToggle(stop)}>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(stop)}
                          className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:text-navy-900 transition-colors px-2 py-1 rounded-lg hover:bg-navy-50"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(stop)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Eliminar
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
                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
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
