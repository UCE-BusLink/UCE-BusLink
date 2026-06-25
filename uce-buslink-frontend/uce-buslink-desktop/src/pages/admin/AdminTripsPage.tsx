import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, X, Clock, Trash2, Bus, User } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchTrips,
  createTrip,
  fetchBuses,
  fetchDrivers,
  type ApiBus,
  type ApiDriver,
} from '../../services/adminService';
import { fetchRoutes } from '../../services/routeService';
import type { ApiTrip, ApiRoute } from '../../types';

const STATE_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const STATE_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

function toIsoSeconds(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function AdminTripsPage() {
  const { getToken } = useAuth();
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [departures, setDepartures] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const [tripsData, routesPage, busesPage, driversData] = await Promise.all([
          fetchTrips(token),
          fetchRoutes(token, 0, 100),
          fetchBuses(token, 0, 100),
          fetchDrivers(token),
        ]);
        if (cancelled) return;
        setTrips(tripsData);
        setRoutes(routesPage.content);
        setBuses(busesPage.content);
        setDrivers(driversData);
      } catch {
        if (!cancelled) setError('No se pudieron cargar los viajes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [getToken, tick]);

  const refetch = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  const routeNames = new Map(routes.map((r) => [r.id, r.name]));
  const busLabels = new Map(buses.map((b) => [b.id, `${b.internalCode} · ${b.plateNumber}`]));
  const driverNames = new Map(drivers.map((d) => [d.id, `${d.nombres} ${d.apellidos}`]));

  function closeForm() {
    setShowForm(false);
    setRouteId('');
    setBusId('');
    setDriverId('');
    setDepartures(['']);
    setSaveError(null);
  }

  function updateDeparture(index: number, value: string) {
    setDepartures((prev) => prev.map((d, i) => (i === index ? value : d)));
  }

  function addDeparture() {
    setDepartures((prev) => [...prev, '']);
  }

  function removeDeparture(index: number) {
    setDepartures((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    const validDepartures = departures.filter((d) => d).map(toIsoSeconds);
    if (!routeId || !busId || !driverId || validDepartures.length === 0) {
      setSaveError('Completa ruta, bus, conductor y al menos un horario de salida.');
      return;
    }
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    await createTrip(token, { routeId, busId, driverId, departures: validDepartures })
      .then(() => { closeForm(); refetch(); })
      .catch(() => setSaveError('No se pudo crear el viaje. Verifica los datos e intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Viajes</h1>
          <p className="text-gray-500 text-sm mt-1">Asigna una ruta y un bus a un conductor.</p>
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
            Asignar viaje
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400 text-sm">{error}</div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay viajes asignados. Crea uno con "Asignar viaje".
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3">Ruta</th>
                <th className="px-5 py-3">Bus</th>
                <th className="px-5 py-3">Conductor</th>
                <th className="px-5 py-3">Salida</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-navy-900">
                    {routeNames.get(trip.routeId) ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {busLabels.get(trip.busId) ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {driverNames.get(trip.driverId) ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{formatDateTime(trip.departureTime)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        STATE_STYLES[trip.state] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {STATE_LABELS[trip.state] ?? trip.state}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-navy-900">Asignar viaje</h2>
              <button onClick={closeForm}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <label htmlFor="trip-route" className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Ruta
                </label>
                <select
                  id="trip-route"
                  name="routeId"
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                >
                  <option value="">Seleccionar ruta</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="trip-bus" className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <Bus size={12} /> Bus
                  </label>
                  <select
                    id="trip-bus"
                    name="busId"
                    value={busId}
                    onChange={(e) => setBusId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  >
                    <option value="">Seleccionar bus</option>
                    {buses.map((b) => (
                      <option key={b.id} value={b.id}>{b.internalCode} · {b.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="trip-driver" className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <User size={12} /> Conductor
                  </label>
                  <select
                    id="trip-driver"
                    name="driverId"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                  >
                    <option value="">Seleccionar conductor</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Clock size={12} /> Horarios de salida
                  </p>
                  <button
                    type="button"
                    onClick={addDeparture}
                    className="flex items-center gap-1 text-xs font-medium text-navy-700 hover:text-navy-900"
                  >
                    <Plus size={13} /> Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {departures.map((value, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        value={value}
                        onChange={(e) => updateDeparture(i, e.target.value)}
                        aria-label={`Horario de salida ${i + 1}`}
                        className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeDeparture(i)}
                        disabled={departures.length === 1}
                        className="text-red-300 hover:text-red-500 disabled:opacity-20"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
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
                  {saving ? 'Creando...' : 'Asignar viaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
