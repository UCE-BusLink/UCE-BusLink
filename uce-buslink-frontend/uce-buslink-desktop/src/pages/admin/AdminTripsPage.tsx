import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, Plus, X, Clock, Bus, User, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchTrips,
  createTrip,
  fetchBuses,
  fetchDrivers,
  fetchRouteSchedules, // <-- Asegúrate de importar la nueva función
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

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-EC', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const ENUM_DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function toLocalIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function AdminTripsPage() {
  const { getToken } = useAuth();
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driversFailed, setDriversFailed] = useState(false);
  const [tick, setTick] = useState(0);

  // Estados del Wizard
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Paso 1: Entidades
  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [driverId, setDriverId] = useState('');

  // Paso 2: Horarios por Día Extraídos del Backend
  // routeTimesByDayEnum guarda los horarios disponibles. Ej: { MONDAY: ['06:00', '12:00'] }
  const [routeTimesByDayEnum, setRouteTimesByDayEnum] = useState<Record<string, string[]>>({});

  // scheduleBlocks guarda los horarios que el usuario ha seleccionado. Ej: { '2026-06-25': ['06:00'] }
  const [scheduleBlocks, setScheduleBlocks] = useState<Record<string, string[]>>({});
  const [selectedDateIso, setSelectedDateIso] = useState<string>('');

  // Generar los próximos 7 días de la semana
  const upcomingDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        iso: toLocalIso(d),
        dayName: d.toLocaleDateString('es-EC', { weekday: 'long' }),
        shortDate: d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }),
        enumDay: ENUM_DAYS[d.getDay()] // Coincide con el "MONDAY", "TUESDAY" del backend
      });
    }
    return days;
  }, []);

  useEffect(() => {
    if (showForm && upcomingDays.length > 0 && !selectedDateIso) {
      setSelectedDateIso(upcomingDays[0].iso);
    }
  }, [showForm, upcomingDays, selectedDateIso]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setError(null);
      setDriversFailed(false);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token || cancelled) return;
        const [tripsResult, routesResult, busesResult, driversResult] = await Promise.allSettled([
          fetchTrips(token),
          fetchRoutes(token, 0, 100),
          fetchBuses(token, 0, 100),
          fetchDrivers(token),
        ]);
        if (cancelled) return;

        if (tripsResult.status === 'fulfilled') setTrips(tripsResult.value);
        else setError('No se pudieron cargar los viajes.');

        if (routesResult.status === 'fulfilled') setRoutes(routesResult.value.content);
        if (busesResult.status === 'fulfilled') setBuses(busesResult.value.content);

        if (driversResult.status === 'fulfilled') setDrivers(driversResult.value);
        else setDriversFailed(true);
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

  if (driversFailed) {
    return <div className="p-8 text-center text-red-400 text-sm">No se pudieron cargar los conductores. Recarga la página.</div>;
  }

  const routeNames = new Map(routes.map((r) => [r.id, r.name]));
  const busLabels = new Map(buses.map((b) => [b.id, `${b.internalCode} · ${b.plateNumber}`]));
  const driverNames = new Map(drivers.map((d) => [d.id, `${d.firstName} ${d.lastName}`]));

  function closeForm() {
    setShowForm(false);
    setCurrentStep(1);
    setRouteId('');
    setBusId('');
    setDriverId('');
    setScheduleBlocks({});
    setRouteTimesByDayEnum({});
    setSelectedDateIso('');
    setSaveError(null);
  }

  // --- TRANSICIÓN AL PASO 2 Y PETICIÓN DE HORARIOS ---
  async function handleNextToStep2() {
    if (!routeId || !busId || !driverId) {
      setSaveError('Por favor, selecciona la ruta, el bus y el conductor para continuar.');
      return;
    }
    setSaveError(null);
    setFetchingSchedules(true);

    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;

      const data = await fetchRouteSchedules(token, routeId);

      const timesMap: Record<string, string[]> = {};

      // Filtrar, agrupar y mapear solo los horarios FIXED
      data.forEach((schedule: any) => {
        if (!schedule.active) return;
        schedule.details.forEach((detail: any) => {
          if (detail.type === 'FIXED') {
            detail.daysOfWeek.forEach((day: string) => {
              if (!timesMap[day]) timesMap[day] = [];
              detail.fixedDepartureTimes.forEach((t: string) => {
                const fullTime = t.length <= 5 ? `${t.padStart(5, '0')}:00` : t.slice(0, 8);
                if (!timesMap[day].includes(fullTime)) {
                  timesMap[day].push(fullTime);
                }
              });
            });
          }
        });
      });

      // Ordenar las horas
      Object.keys(timesMap).forEach(day => timesMap[day].sort());

      setRouteTimesByDayEnum(timesMap);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setSaveError('No se pudieron obtener los horarios predefinidos para esta ruta.');
    } finally {
      setFetchingSchedules(false);
    }
  }

  // --- LÓGICA DE SELECCIÓN Y VALIDACIÓN DE 2.5 HORAS (150 MINUTOS) ---
  function toggleTimeSelection(dateIso: string, timeToToggle: string) {
    const currentTimes = scheduleBlocks[dateIso] || [];

    // Si ya está seleccionado, lo desmarcamos
    if (currentTimes.includes(timeToToggle)) {
      setScheduleBlocks(prev => ({
        ...prev,
        [dateIso]: currentTimes.filter(t => t !== timeToToggle)
      }));
      setSaveError(null);
      return;
    }

    // Si NO está seleccionado, validamos y luego añadimos
    const [newH, newM] = timeToToggle.split(':').map(Number);
    const newMins = newH * 60 + newM;

    for (const existTime of currentTimes) {
      const [eH, eM] = existTime.split(':').map(Number);
      const eMins = eH * 60 + eM;

      const diffMins = Math.abs(newMins - eMins);

      if (diffMins < 150) {
        setSaveError(`No puedes marcar las ${timeToToggle}. Ya has seleccionado las ${existTime}. Debe haber un margen mínimo de 2.5 horas entre salidas.`);
        return;
      }
    }

    setSaveError(null);
    setScheduleBlocks(prev => ({
      ...prev,
      [dateIso]: [...currentTimes, timeToToggle].sort()
    }));
  }

  // --- FINALIZAR Y ENVIAR AL BACKEND ---
  async function handleCreate() {
    setSaveError(null);

    // Formatear los bloques a ISO Strings
    const validDepartures: string[] = [];
    Object.entries(scheduleBlocks).forEach(([dateIso, times]) => {
      times.forEach(t => {
        const fullTime = t.length <= 5 ? `${t}:00` : t;
        validDepartures.push(`${dateIso}T${fullTime}`);
      });
    });

    if (validDepartures.length === 0) {
      setSaveError('Debes seleccionar al menos un horario de salida en alguno de los días.');
      return;
    }

    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;

    setSaving(true);
    await createTrip(token, { routeId, busId, driverId, departures: validDepartures })
      .then(() => { closeForm(); refetch(); })
      .catch((err) => setSaveError(err instanceof Error ? err.message : 'No se pudo crear el viaje. Verifica los datos e intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  // Ayudante para obtener el enum ('MONDAY') del día seleccionado actualmente
  const currentSelectedDayEnum = upcomingDays.find(d => d.iso === selectedDateIso)?.enumDay || '';
  const availableTimesForCurrentDay = routeTimesByDayEnum[currentSelectedDayEnum] || [];

  return (
    <div>
      {/* --- CABECERA PRINCIPAL --- */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Viajes</h1>
          <p className="text-gray-500 text-sm mt-1">Asigna rutas y buses a conductores en horarios específicos.</p>
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

      {/* --- TABLA DE VIAJES --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Lógica de Renderizado de la tabla idéntica a antes */}
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
                <th className="px-5 py-3">Salida (Día y Hora)</th>
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
                  <td className="px-5 py-4 text-sm text-gray-600 capitalize">
                    {formatDateTime(trip.departureTime)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATE_STYLES[trip.state] ?? 'bg-gray-100 text-gray-600'
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

      {/* --- WIZARD DE CREACIÓN DE VIAJES --- */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-navy-900">Asignar Nuevo Viaje</h2>
                <button onClick={closeForm}>
                  <X size={20} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              {/* Stepper */}
              <div className="flex items-center justify-between relative max-w-sm mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10"></div>
                {[
                  { step: 1, label: 'Detalles' },
                  { step: 2, label: 'Horarios de Ruta' }
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center bg-white px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentStep >= s.step ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-400'
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

            {/* Contenido Dinámico */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* PASO 1: Selección de Entidades */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Ruta de Operación
                    </label>
                    <select
                      value={routeId}
                      onChange={(e) => setRouteId(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-gray-50 hover:bg-white transition-colors"
                    >
                      <option value="">Seleccionar ruta</option>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        <Bus size={14} /> Unidad de Bus
                      </label>
                      <select
                        value={busId}
                        onChange={(e) => setBusId(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-gray-50 hover:bg-white transition-colors"
                      >
                        <option value="">Seleccionar bus</option>
                        {buses.map((b) => (
                          <option key={b.id} value={b.id}>{b.internalCode} · {b.plateNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                        <User size={14} /> Conductor Asignado
                      </label>
                      <select
                        value={driverId}
                        onChange={(e) => setDriverId(e.target.value)}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy-900/20 bg-gray-50 hover:bg-white transition-colors"
                      >
                        <option value="">Seleccionar conductor</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: Selección de Horarios Dinámicos Extraídos de la Ruta */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in slide-in-from-right-4">

                  {/* Selector de Días (Tabs) */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Días de la semana
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {upcomingDays.map(day => {
                        const hasHoursSelected = (scheduleBlocks[day.iso] || []).length > 0;
                        return (
                          <button
                            key={day.iso}
                            type="button"
                            onClick={() => {
                              setSelectedDateIso(day.iso);
                              setSaveError(null);
                            }}
                            className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-left transition-all relative ${selectedDateIso === day.iso
                              ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                              }`}
                          >
                            <span className="block text-sm font-bold capitalize">{day.dayName}</span>
                            <span className={`block text-[10px] ${selectedDateIso === day.iso ? 'text-navy-100' : 'text-gray-400'}`}>
                              {day.shortDate}
                            </span>
                            {/* Indicador visual de selecciones hechas */}
                            {hasHoursSelected && selectedDateIso !== day.iso && (
                              <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Panel de Horarios DISPONIBLES de la Ruta para el día seleccionado */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-navy-900 mb-2 capitalize flex items-center gap-2">
                      <Clock size={16} className="text-navy-500" />
                      Horarios disponibles para el {upcomingDays.find(d => d.iso === selectedDateIso)?.dayName}
                    </h4>

                    <p className="text-[11px] text-gray-500 mb-4">
                      Estos son los horarios fijos configurados previamente en esta ruta. Haz clic para asignar.
                    </p>

                    {/* Lista de chips clickeables */}
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {availableTimesForCurrentDay.length === 0 ? (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs w-full border border-amber-100">
                          <AlertCircle size={14} /> La ruta seleccionada no tiene horarios fijos para este día.
                        </div>
                      ) : (
                        availableTimesForCurrentDay.map(time => {
                          const isSelected = (scheduleBlocks[selectedDateIso] || []).includes(time);
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleTimeSelection(selectedDateIso, time)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSelected
                                ? 'bg-navy-900 text-white border-navy-900 shadow-md ring-2 ring-navy-900/20 ring-offset-1'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                              {time.slice(0, 5)}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Resumen Global de lo que ha sido seleccionado */}
                  <div className="border-t border-gray-100 pt-4 mt-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen de Viajes a Crear</p>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                      {Object.entries(scheduleBlocks).filter(([_, times]) => times.length > 0).map(([dateIso, times]) => {
                        const dayInfo = upcomingDays.find(d => d.iso === dateIso);
                        return (
                          <div key={dateIso} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs">
                            <span className="font-bold text-navy-900 capitalize">{dayInfo?.dayName}</span>
                            <span className="text-emerald-600 font-bold">{times.map(t => t.slice(0, 5)).join(' | ')}</span>
                          </div>
                        );
                      })}
                      {Object.values(scheduleBlocks).every(times => times.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No has seleccionado ningún horario todavía.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Errores */}
              {saveError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium animate-in slide-in-from-bottom-2">
                  {saveError}
                </div>
              )}
            </div>

            {/* Footer de Controles */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
              {currentStep === 2 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy-900 transition-colors"
                >
                  Regresar
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>

                {currentStep === 1 && (
                  <button
                    type="button"
                    onClick={handleNextToStep2}
                    disabled={fetchingSchedules}
                    className="flex items-center gap-1.5 px-5 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 disabled:opacity-50 transition-colors"
                  >
                    {fetchingSchedules ? 'Cargando horarios...' : 'Siguiente'} <ChevronRight size={16} />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Calendar size={16} />
                    {saving ? 'Guardando...' : 'Finalizar Asignación'}
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