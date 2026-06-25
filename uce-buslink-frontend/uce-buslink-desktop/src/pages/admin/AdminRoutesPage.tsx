import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, CheckCircle, XCircle, Clock, MapPin, Eye, RefreshCw, Plus, X, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRoutes } from '../../hooks/useRoutes';
import { createRoute, fetchStops, type ApiStop, type RouteStopPayload } from '../../services/adminService';

const EMPTY_FORM = { name: '', description: '', estimatedDurationMinutes: '' };

interface SelectedStop extends RouteStopPayload {
  stopName: string;
}

export function AdminRoutesPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { routes, loading, error, refetch } = useRoutes();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [availableStops, setAvailableStops] = useState<ApiStop[]>([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [selectedStops, setSelectedStops] = useState<SelectedStop[]>([]);
  const [pickStopId, setPickStopId] = useState('');

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!showForm) return;
    let cancelled = false;

    async function loadStops() {
      setStopsLoading(true);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const data = await fetchStops(token);
        if (!cancelled) setAvailableStops(data.filter((s) => s.isActive));
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setStopsLoading(false);
      }
    }

    loadStops();
    return () => { cancelled = true; };
  }, [showForm, getToken]);

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSelectedStops([]);
    setPickStopId('');
    setSaveError(null);
  }

  function addStop() {
    if (!pickStopId) return;
    if (selectedStops.some((s) => s.stopId === pickStopId)) return;
    const stop = availableStops.find((s) => s.id === pickStopId);
    if (!stop) return;
    setSelectedStops((prev) => [
      ...prev,
      {
        stopId: stop.id,
        stopName: stop.name,
        stopOrder: prev.length + 1,
        estimatedMinutesFromStart: 0,
        stopDurationMinutes: 1,
      },
    ]);
    setPickStopId('');
  }

  function removeStop(index: number) {
    setSelectedStops((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stopOrder: i + 1 }))
    );
  }

  function moveStop(index: number, dir: -1 | 1) {
    setSelectedStops((prev) => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next.map((s, i) => ({ ...s, stopOrder: i + 1 }));
    });
  }

  function updateStop(index: number, field: 'estimatedMinutesFromStart' | 'stopDurationMinutes', value: string) {
    setSelectedStops((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: Number(value) } : s))
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    await createRoute(token, {
      name: form.name,
      description: form.description,
      estimatedDurationMinutes: Number(form.estimatedDurationMinutes),
      pathPolyline: '',
      stops: selectedStops.map(({ stopId, stopOrder, estimatedMinutesFromStart, stopDurationMinutes }) => ({
        stopId,
        stopOrder,
        estimatedMinutesFromStart,
        stopDurationMinutes,
      })),
    })
      .then(() => { closeForm(); refetch(); })
      .catch(() => setSaveError('No se pudo crear la ruta. Intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  const unselectedStops = availableStops.filter((s) => !selectedStops.some((ss) => ss.stopId === s.id));

  return (
    <div>
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
          <table className="w-full">
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
              {filtered.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50 transition-colors">
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
                      onClick={() => navigate(`/admin/routes/${route.id}`)}
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
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-navy-900">Nueva ruta</h2>
              <button onClick={closeForm}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <label htmlFor="route-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Nombre
                </label>
                <input
                  id="route-name"
                  name="name"
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Ruta 1: Perimetral UCE"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                />
              </div>

              <div>
                <label htmlFor="route-description" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Descripción
                </label>
                <textarea
                  id="route-description"
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción opcional de la ruta"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 resize-none"
                />
              </div>

              <div>
                <label htmlFor="route-duration" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Duración estimada (minutos)
                </label>
                <input
                  id="route-duration"
                  name="estimatedDurationMinutes"
                  required
                  type="number"
                  min={1}
                  value={form.estimatedDurationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedDurationMinutes: e.target.value }))}
                  placeholder="Ej. 15"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Paradas ({selectedStops.length})
                </p>

                <div className="flex gap-2 mb-3">
                  <select
                    id="route-stop-pick"
                    name="stopPick"
                    value={pickStopId}
                    onChange={(e) => setPickStopId(e.target.value)}
                    disabled={stopsLoading || unselectedStops.length === 0}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 disabled:opacity-50"
                  >
                    <option value="">
                      {stopsLoading ? 'Cargando paradas...' : unselectedStops.length === 0 ? 'Todas las paradas añadidas' : 'Seleccionar parada'}
                    </option>
                    {unselectedStops.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addStop}
                    disabled={!pickStopId}
                    className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-navy-800 transition-colors"
                  >
                    <Plus size={14} />
                    Agregar
                  </button>
                </div>

                {selectedStops.length > 0 && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    {selectedStops.map((stop, i) => (
                      <div key={stop.stopId} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 bg-white">
                        <span className="w-5 h-5 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center flex-shrink-0 font-semibold">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm font-medium text-navy-900 truncate">{stop.stopName}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 mb-0.5">Min. inicio</span>
                            <input
                              type="number"
                              min={0}
                              value={stop.estimatedMinutesFromStart}
                              onChange={(e) => updateStop(i, 'estimatedMinutesFromStart', e.target.value)}
                              aria-label={`Minutos desde inicio para ${stop.stopName}`}
                              className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-navy-900/20"
                            />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-gray-400 mb-0.5">Duración</span>
                            <input
                              type="number"
                              min={0}
                              value={stop.stopDurationMinutes}
                              onChange={(e) => updateStop(i, 'stopDurationMinutes', e.target.value)}
                              aria-label={`Duración en parada ${stop.stopName}`}
                              className="w-14 px-2 py-1 text-xs border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-navy-900/20"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button type="button" onClick={() => moveStop(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                              <ArrowUp size={13} />
                            </button>
                            <button type="button" onClick={() => moveStop(i, 1)} disabled={i === selectedStops.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20">
                              <ArrowDown size={13} />
                            </button>
                          </div>
                          <button type="button" onClick={() => removeStop(i)} className="text-red-300 hover:text-red-500 ml-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {saveError && <p className="text-xs text-red-400">{saveError}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Creando...' : 'Crear ruta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
