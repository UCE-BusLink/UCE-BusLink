import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { RefreshCw, Plus, X, Clock, Bus, User, ChevronRight, Calendar, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import {
  fetchTrips, createTrip, fetchBuses, fetchDrivers, fetchRouteSchedules,
  type ApiBus, type ApiDriver,
} from '../../services/adminService';
import { fetchRoutes } from '../../services/routeService';
import type { ApiTrip, ApiRoute } from '../../types';
import { Select } from '../../components/atoms';
import { ScreenContainer } from '../../components/layout/ScreenContainer';

const STATE_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100', IN_PROGRESS: 'bg-amber-100', COMPLETED: 'bg-green-100', CANCELLED: 'bg-red-100',
};
const STATE_TEXT: Record<string, string> = {
  SCHEDULED: 'text-blue-700', IN_PROGRESS: 'text-amber-700', COMPLETED: 'text-green-700', CANCELLED: 'text-red-600',
};
const STATE_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado', IN_PROGRESS: 'En curso', COMPLETED: 'Completado', CANCELLED: 'Cancelado',
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-EC', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

const ENUM_DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function toLocalIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function AdminTripsScreen() {
  const { getToken } = useAuth();
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driversFailed, setDriversFailed] = useState(false);
  const [tick, setTick] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [fetchingSchedules, setFetchingSchedules] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [driverId, setDriverId] = useState('');

  const [routeTimesByDayEnum, setRouteTimesByDayEnum] = useState<Record<string, string[]>>({});
  const [scheduleBlocks, setScheduleBlocks] = useState<Record<string, string[]>>({});
  const [selectedDateIso, setSelectedDateIso] = useState<string>('');

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
        enumDay: ENUM_DAYS[d.getDay()],
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
          fetchTrips(token), fetchRoutes(token, 0, 100), fetchBuses(token, 0, 100), fetchDrivers(token),
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

  const refetch = useCallback(() => { setLoading(true); setTick((t) => t + 1); }, []);

  const routeNames = new Map(routes.map((r) => [r.id, r.name]));
  const busLabels = new Map(buses.map((b) => [b.id, `${b.internalCode} · ${b.plateNumber}`]));
  const driverNames = new Map(drivers.map((d) => [d.id, `${d.firstName} ${d.lastName}`]));

  function closeForm() {
    setShowForm(false); setCurrentStep(1); setRouteId(''); setBusId(''); setDriverId('');
    setScheduleBlocks({}); setRouteTimesByDayEnum({}); setSelectedDateIso(''); setSaveError(null);
  }

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
      data.forEach((schedule: any) => {
        if (!schedule.active) return;
        schedule.details.forEach((detail: any) => {
          if (detail.type === 'FIXED') {
            detail.daysOfWeek.forEach((day: string) => {
              if (!timesMap[day]) timesMap[day] = [];
              detail.fixedDepartureTimes.forEach((t: string) => {
                const fullTime = t.length <= 5 ? `${t.padStart(5, '0')}:00` : t.slice(0, 8);
                if (!timesMap[day].includes(fullTime)) timesMap[day].push(fullTime);
              });
            });
          }
        });
      });
      Object.keys(timesMap).forEach((day) => timesMap[day].sort());
      setRouteTimesByDayEnum(timesMap);
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setSaveError('No se pudieron obtener los horarios predefinidos para esta ruta.');
    } finally {
      setFetchingSchedules(false);
    }
  }

  function toggleTimeSelection(dateIso: string, timeToToggle: string) {
    const currentTimes = scheduleBlocks[dateIso] || [];
    if (currentTimes.includes(timeToToggle)) {
      setScheduleBlocks((prev) => ({ ...prev, [dateIso]: currentTimes.filter((t) => t !== timeToToggle) }));
      setSaveError(null);
      return;
    }
    const [newH, newM] = timeToToggle.split(':').map(Number);
    const newMins = newH * 60 + newM;
    for (const existTime of currentTimes) {
      const [eH, eM] = existTime.split(':').map(Number);
      const eMins = eH * 60 + eM;
      if (Math.abs(newMins - eMins) < 150) {
        setSaveError(`No puedes marcar las ${timeToToggle}. Ya has seleccionado las ${existTime}. Debe haber un margen mínimo de 2.5 horas entre salidas.`);
        return;
      }
    }
    setSaveError(null);
    setScheduleBlocks((prev) => ({ ...prev, [dateIso]: [...currentTimes, timeToToggle].sort() }));
  }

  async function handleCreate() {
    setSaveError(null);
    const validDepartures: string[] = [];
    Object.entries(scheduleBlocks).forEach(([dateIso, times]) => {
      times.forEach((t) => {
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

  const currentSelectedDayEnum = upcomingDays.find((d) => d.iso === selectedDateIso)?.enumDay || '';
  const availableTimesForCurrentDay = routeTimesByDayEnum[currentSelectedDayEnum] || [];

  if (driversFailed) {
    return (
      <ScreenContainer>
        <Text className="p-8 text-center text-red-400 text-sm">No se pudieron cargar los conductores. Recarga la página.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-navy-900">Viajes</Text>
          <Text className="text-gray-500 text-sm mt-1">Asigna rutas y buses a conductores.</Text>
        </View>
        <Pressable onPress={() => setShowForm(true)} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800">
          <Plus size={15} color="#ffffff" />
          <Text className="text-white text-sm font-semibold">Asignar</Text>
        </Pressable>
      </View>

      <Pressable onPress={refetch} className="flex-row items-center gap-2 self-start px-4 py-2 rounded-xl border border-gray-200 mb-4">
        <RefreshCw size={14} color="#4b5563" />
        <Text className="text-sm text-gray-600">Recargar</Text>
      </Pressable>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <View className="p-6 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <View key={i} className="h-14 bg-gray-50 rounded-xl" />)}
          </View>
        ) : error ? (
          <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
        ) : trips.length === 0 ? (
          <Text className="p-8 text-center text-gray-400 text-sm">No hay viajes asignados. Crea uno con "Asignar".</Text>
        ) : (
          trips.map((trip) => (
            <View key={trip.id} className="px-5 py-4 border-b border-gray-50">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-semibold text-navy-900 flex-1">{routeNames.get(trip.routeId) ?? '—'}</Text>
                <View className={`px-2.5 py-1 rounded-full ${STATE_STYLES[trip.state] ?? 'bg-gray-100'}`}>
                  <Text className={`text-xs font-medium ${STATE_TEXT[trip.state] ?? 'text-gray-600'}`}>
                    {STATE_LABELS[trip.state] ?? trip.state}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-gray-500">{busLabels.get(trip.busId) ?? '—'} · {driverNames.get(trip.driverId) ?? '—'}</Text>
              <Text className="text-xs text-gray-600 capitalize mt-0.5">{formatDateTime(trip.departureTime)}</Text>
            </View>
          ))
        )}
      </View>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl max-h-[90%]">
            <View className="px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-lg text-navy-900">Asignar Nuevo Viaje</Text>
                <Pressable onPress={closeForm}><X size={20} color="#9ca3af" /></Pressable>
              </View>
              <View className="flex-row items-center justify-center gap-10">
                {[{ step: 1, label: 'Detalles' }, { step: 2, label: 'Horarios' }].map((s) => (
                  <View key={s.step} className="items-center">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= s.step ? 'bg-navy-900' : 'bg-gray-100'}`}>
                      <Text className={`text-sm font-bold ${currentStep >= s.step ? 'text-white' : 'text-gray-400'}`}>{s.step}</Text>
                    </View>
                    <Text className={`text-xs mt-1 font-medium ${currentStep >= s.step ? 'text-navy-900' : 'text-gray-400'}`}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24 }}>
              {currentStep === 1 && (
                <View className="gap-5">
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Ruta de Operación</Text>
                    <Select
                      value={routeId}
                      placeholder="Seleccionar ruta"
                      options={routes.map((r) => ({ label: r.name, value: r.id }))}
                      onChange={setRouteId}
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <Bus size={14} color="#6b7280" />
                      <Text className="text-xs font-semibold text-gray-500 uppercase">Unidad de Bus</Text>
                    </View>
                    <Select
                      value={busId}
                      placeholder="Seleccionar bus"
                      options={buses.map((b) => ({ label: `${b.internalCode} · ${b.plateNumber}`, value: b.id }))}
                      onChange={setBusId}
                    />
                  </View>
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-1.5">
                      <User size={14} color="#6b7280" />
                      <Text className="text-xs font-semibold text-gray-500 uppercase">Conductor Asignado</Text>
                    </View>
                    <Select
                      value={driverId}
                      placeholder="Seleccionar conductor"
                      options={drivers.map((d) => ({ label: `${d.firstName} ${d.lastName}`, value: d.id }))}
                      onChange={setDriverId}
                    />
                  </View>
                </View>
              )}

              {currentStep === 2 && (
                <View className="gap-5">
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Días de la semana</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View className="flex-row gap-2">
                        {upcomingDays.map((day) => {
                          const hasHoursSelected = (scheduleBlocks[day.iso] || []).length > 0;
                          const active = selectedDateIso === day.iso;
                          return (
                            <Pressable
                              key={day.iso}
                              onPress={() => { setSelectedDateIso(day.iso); setSaveError(null); }}
                              className={`px-4 py-2.5 rounded-xl border ${active ? 'bg-navy-900 border-navy-900' : 'bg-white border-gray-200'}`}
                            >
                              <Text className={`text-sm font-bold capitalize ${active ? 'text-white' : 'text-gray-600'}`}>{day.dayName}</Text>
                              <View className="flex-row items-center gap-1">
                                <Text className={`text-[10px] ${active ? 'text-navy-100' : 'text-gray-400'}`}>{day.shortDate}</Text>
                                {hasHoursSelected && !active && <View className="w-2 h-2 bg-emerald-500 rounded-full" />}
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  <View className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Clock size={16} color="#1a3a5c" />
                      <Text className="text-sm font-bold text-navy-900 capitalize">
                        Horarios para {upcomingDays.find((d) => d.iso === selectedDateIso)?.dayName}
                      </Text>
                    </View>
                    <Text className="text-[11px] text-gray-500 mb-4">
                      Horarios fijos configurados en esta ruta. Toca para asignar.
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                      {availableTimesForCurrentDay.length === 0 ? (
                        <View className="flex-row items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 w-full">
                          <AlertCircle size={14} color="#d97706" />
                          <Text className="text-amber-600 text-xs flex-1">La ruta no tiene horarios fijos para este día.</Text>
                        </View>
                      ) : (
                        availableTimesForCurrentDay.map((time) => {
                          const isSelected = (scheduleBlocks[selectedDateIso] || []).includes(time);
                          return (
                            <Pressable
                              key={time}
                              onPress={() => toggleTimeSelection(selectedDateIso, time)}
                              className={`px-4 py-2 rounded-xl border ${isSelected ? 'bg-navy-900 border-navy-900' : 'bg-white border-gray-200'}`}
                            >
                              <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>{time.slice(0, 5)}</Text>
                            </Pressable>
                          );
                        })
                      )}
                    </View>
                  </View>

                  <View className="border-t border-gray-100 pt-4">
                    <Text className="text-[11px] font-bold text-gray-400 uppercase mb-2">Resumen de Viajes a Crear</Text>
                    {Object.entries(scheduleBlocks).filter(([, t]) => t.length > 0).map(([dateIso, times]) => {
                      const dayInfo = upcomingDays.find((d) => d.iso === dateIso);
                      return (
                        <View key={dateIso} className="flex-row items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg mb-1.5">
                          <Text className="font-bold text-navy-900 capitalize text-xs">{dayInfo?.dayName}</Text>
                          <Text className="text-emerald-600 font-bold text-xs">{times.map((t) => t.slice(0, 5)).join(' | ')}</Text>
                        </View>
                      );
                    })}
                    {Object.values(scheduleBlocks).every((t) => t.length === 0) && (
                      <Text className="text-xs text-gray-400 italic">No has seleccionado ningún horario todavía.</Text>
                    )}
                  </View>
                </View>
              )}

              {saveError ? (
                <View className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <Text className="text-sm text-red-600 font-medium">{saveError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View className="px-6 py-4 border-t border-gray-100 flex-row justify-between items-center">
              {currentStep === 2 ? (
                <Pressable onPress={() => setCurrentStep(1)} disabled={saving}>
                  <Text className="text-sm font-medium text-gray-600">Regresar</Text>
                </Pressable>
              ) : <View />}

              <View className="flex-row gap-2">
                <Pressable onPress={closeForm} disabled={saving} className="px-4 py-2">
                  <Text className="text-sm font-medium text-gray-500">Cancelar</Text>
                </Pressable>
                {currentStep === 1 && (
                  <Pressable onPress={handleNextToStep2} disabled={fetchingSchedules} className={`flex-row items-center gap-1.5 px-5 py-2 bg-navy-900 rounded-xl ${fetchingSchedules ? 'opacity-50' : 'active:bg-navy-800'}`}>
                    <Text className="text-white text-sm font-semibold">{fetchingSchedules ? 'Cargando...' : 'Siguiente'}</Text>
                    <ChevronRight size={16} color="#ffffff" />
                  </Pressable>
                )}
                {currentStep === 2 && (
                  <Pressable onPress={handleCreate} disabled={saving} className={`flex-row items-center gap-1.5 px-5 py-2 bg-green-600 rounded-xl ${saving ? 'opacity-50' : 'active:opacity-90'}`}>
                    <Calendar size={16} color="#ffffff" />
                    <Text className="text-white text-sm font-semibold">{saving ? 'Guardando...' : 'Finalizar'}</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
