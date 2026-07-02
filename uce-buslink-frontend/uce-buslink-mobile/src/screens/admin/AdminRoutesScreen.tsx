import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  Bus, CheckCircle, XCircle, Clock, MapPin, Eye, RefreshCw, Plus, X, Trash2, ChevronRight, Calendar,
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRoutes } from '../../hooks/useRoutes';
import {
  createRoute, createBatchStops, previewRoute, createSchedule, fetchStops,
  type BatchStop, type ApiStop,
} from '../../services/adminService';
import { decodePolyline } from '../../utils/mapUtils';
import { Select } from '../../components/atoms';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { RootStackParamList } from '../../navigation/types';

const DAYS_OF_WEEK = [
  { id: 'MONDAY', label: 'Lunes' },
  { id: 'TUESDAY', label: 'Martes' },
  { id: 'WEDNESDAY', label: 'Miércoles' },
  { id: 'THURSDAY', label: 'Jueves' },
  { id: 'FRIDAY', label: 'Viernes' },
  { id: 'SATURDAY', label: 'Sábado' },
  { id: 'SUNDAY', label: 'Domingo' },
];

const EMPTY_FORM = { name: '', description: '', estimatedDurationMinutes: '' };
const MAP_CENTER_DEFAULT = { latitude: -0.1989, longitude: -78.5065 };

interface ScheduleGroup { daysOfWeek: string[]; fixedDepartureTimes: string[]; }
interface OrderedStop { id?: string; name: string; latitude: number; longitude: number; }

export function AdminRoutesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getToken } = useAuth();
  const { routes, loading, error, refetch } = useRoutes();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [newStops, setNewStops] = useState<OrderedStop[]>([]);
  const [tempStop, setTempStop] = useState({ name: '', latitude: '', longitude: '' });
  const [availableStops, setAvailableStops] = useState<ApiStop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState('');
  const [createdRouteId, setCreatedRouteId] = useState<string | null>(null);
  const [routePolylineRaw, setRoutePolylineRaw] = useState<string>('');

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([]);
  const [currentGroupDays, setCurrentGroupDays] = useState<string[]>([]);
  const [currentGroupTimes, setCurrentGroupTimes] = useState<string[]>([]);
  const [tempTime, setTempTime] = useState('');

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
    setNewStops([...newStops, { id: stop.id, name: stop.name, latitude: stop.latitude, longitude: stop.longitude }]);
    setSelectedStopId('');
  }

  function handleMapClick(lat: number, lng: number) {
    setTempStop((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
  }

  function closeForm() {
    setShowForm(false); setCurrentStep(1); setForm(EMPTY_FORM); setNewStops([]);
    setTempStop({ name: '', latitude: '', longitude: '' }); setSelectedStopId('');
    setScheduleGroups([]); setCurrentGroupDays([]); setCurrentGroupTimes([]);
    setCreatedRouteId(null); setRoutePolylineRaw(''); setSaveError(null);
  }

  function handleAddTempStop() {
    if (!tempStop.name || !tempStop.latitude || !tempStop.longitude) return;
    setNewStops([...newStops, { name: tempStop.name, latitude: parseFloat(tempStop.latitude), longitude: parseFloat(tempStop.longitude) }]);
    setTempStop({ name: '', latitude: '', longitude: '' });
  }

  function removeNewStop(index: number) {
    setNewStops(newStops.filter((_, i) => i !== index));
  }

  function handleAddScheduleGroup() {
    if (currentGroupDays.length === 0 || currentGroupTimes.length === 0) {
      setSaveError('Selecciona al menos un día y un horario para agregar el bloque de operación.');
      return;
    }
    setSaveError(null);
    setScheduleGroups([...scheduleGroups, { daysOfWeek: currentGroupDays, fixedDepartureTimes: [...currentGroupTimes].sort() }]);
    setCurrentGroupDays([]); setCurrentGroupTimes([]);
  }

  async function handleNextFromStep2() {
    if (newStops.length < 2) { setSaveError('Añade al menos 2 paradas para trazar una ruta.'); return; }
    setSaveError(null); setSaving(true);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No autorizado');
      const stopsToCreate: BatchStop[] = newStops.filter((s) => !s.id).map((s) => ({ name: s.name, latitude: s.latitude, longitude: s.longitude }));
      const createdStops = stopsToCreate.length ? await createBatchStops(token, stopsToCreate) : [];
      let createdIndex = 0;
      const orderedStops = newStops.map((s) => (s.id ? s : { ...s, id: createdStops[createdIndex++].id as string }));
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
          stopId: s.id as string, stopOrder: index + 1, estimatedMinutesFromStart: index * 5, stopDurationMinutes: 1,
        })),
      };
      const savedRoute = await createRoute(token, routePayload);
      if (!savedRoute || !savedRoute.id) throw new Error('No se recibió el ID de la ruta creada');
      setCreatedRouteId(savedRoute.id);
      setCurrentStep(3);
    } catch (err) {
      setSaveError(`Error al procesar las paradas y la ruta: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizeSchedule() {
    if (scheduleGroups.length === 0) { setSaveError('Debes estructurar al menos un bloque de horarios antes de finalizar.'); return; }
    setSaving(true);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token || !createdRouteId) return;
      const schedulePayload = {
        routeId: createdRouteId,
        details: scheduleGroups.map((group) => ({
          type: 'FIXED', daysOfWeek: group.daysOfWeek, fixedDepartureTimes: group.fixedDepartureTimes,
          frequencyStartTime: null, frequencyEndTime: null, frequencyIntervalMinutes: null,
        })),
      };
      await createSchedule(token, schedulePayload);
      closeForm(); refetch();
    } catch (err) {
      setSaveError(`No se pudieron almacenar los bloques de horarios: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  }

  const filtered = routes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const tempMarker = tempStop.latitude && tempStop.longitude
    ? { latitude: parseFloat(tempStop.latitude), longitude: parseFloat(tempStop.longitude) }
    : null;
  const inputCls = 'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900';

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-navy-900">Rutas</Text>
          <Text className="text-gray-500 text-sm mt-1">{routes.length} registradas</Text>
        </View>
        <Pressable onPress={() => setShowForm(true)} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800">
          <Plus size={15} color="#ffffff" />
          <Text className="text-white text-sm font-semibold">Nueva</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
        <TextInput value={search} onChangeText={setSearch} placeholder="Buscar ruta..." placeholderTextColor="#9ca3af" className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900" />
        <Pressable onPress={refetch} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200">
          <RefreshCw size={15} color="#4b5563" />
          <Text className="text-sm text-gray-600">Recargar</Text>
        </Pressable>
      </View>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <View className="p-6 gap-3">{Array.from({ length: 4 }).map((_, i) => <View key={i} className="h-14 bg-gray-50 rounded-xl" />)}</View>
        ) : error ? (
          <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
        ) : filtered.length === 0 ? (
          <Text className="p-8 text-center text-gray-400 text-sm">No se encontraron rutas.</Text>
        ) : (
          filtered.map((route) => (
            <View key={route.id} className="px-5 py-4 border-b border-gray-50">
              <View className="flex-row items-center gap-2.5 mb-2">
                <View className="w-8 h-8 bg-navy-50 rounded-lg items-center justify-center">
                  <Bus size={14} color="#1a3a5c" />
                </View>
                <Text className="text-sm font-semibold text-navy-900 flex-1">{route.name}</Text>
                {route.isActive ? (
                  <View className="flex-row items-center gap-1 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle size={12} color="#16a34a" />
                    <Text className="text-xs text-green-600 font-medium">Activa</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                    <XCircle size={12} color="#9ca3af" />
                    <Text className="text-xs text-gray-400 font-medium">Inactiva</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1">
                    <Clock size={13} color="#f59e0b" />
                    <Text className="text-sm text-gray-600">{route.estimatedDurationMinutes ? `${route.estimatedDurationMinutes} min` : '—'}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MapPin size={13} color="#1a3a5c" />
                    <Text className="text-sm text-gray-600">{route.stops?.length ?? 0} paradas</Text>
                  </View>
                </View>
                <Pressable onPress={() => navigation.navigate('RouteDetail', { routeId: route.id, admin: true })} className="flex-row items-center gap-1.5">
                  <Eye size={14} color="#1a3a5c" />
                  <Text className="text-xs font-medium text-navy-700">Ver detalle</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl max-h-[92%]">
            <View className="px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="font-bold text-lg text-navy-900">Crear Nueva Ruta</Text>
                <Pressable onPress={closeForm}><X size={20} color="#9ca3af" /></Pressable>
              </View>
              <View className="flex-row items-center justify-center gap-6">
                {[{ step: 1, label: 'Info' }, { step: 2, label: 'Paradas' }, { step: 3, label: 'Horarios' }].map((s) => (
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
                    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Nombre de la Ruta</Text>
                    <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="Ej. Troncal Sur" placeholderTextColor="#9ca3af" className={inputCls} />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Descripción</Text>
                    <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Detalles del recorrido..." placeholderTextColor="#9ca3af" multiline numberOfLines={3} className={`${inputCls} h-20`} style={{ textAlignVertical: 'top' }} />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Duración estimada (minutos)</Text>
                    <TextInput value={form.estimatedDurationMinutes} onChangeText={(v) => setForm({ ...form, estimatedDurationMinutes: v })} placeholder="Ej. 35" placeholderTextColor="#9ca3af" keyboardType="number-pad" className={inputCls} />
                  </View>
                </View>
              )}

              {currentStep === 2 && (
                <View className="gap-4">
                  <View className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <Text className="text-xs text-blue-800">Añade una parada guardada o toca el mapa para crear una nueva.</Text>
                  </View>

                  <View className="bg-white p-4 rounded-xl border border-gray-200 gap-2">
                    <Text className="text-xs text-gray-500 font-medium">Añadir parada guardada</Text>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Select
                          value={selectedStopId}
                          placeholder="Selecciona una parada..."
                          options={availableStops.filter((s) => !newStops.some((ns) => ns.id === s.id)).map((s) => ({ label: s.name, value: s.id }))}
                          onChange={setSelectedStopId}
                        />
                      </View>
                      <Pressable onPress={handleAddExistingStop} disabled={!selectedStopId} className={`px-3 justify-center bg-navy-900 rounded-lg ${!selectedStopId ? 'opacity-40' : 'active:bg-navy-800'}`}>
                        <Plus size={16} color="#ffffff" />
                      </Pressable>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 h-px bg-gray-100" />
                    <Text className="text-[11px] text-gray-400 uppercase">o crea una nueva</Text>
                    <View className="flex-1 h-px bg-gray-100" />
                  </View>

                  <View className="h-64 rounded-2xl overflow-hidden border border-gray-200">
                    <MapView
                      provider={PROVIDER_DEFAULT}
                      style={{ flex: 1 }}
                      initialRegion={{ ...MAP_CENTER_DEFAULT, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
                      onPress={(e) => handleMapClick(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}
                    >
                      {newStops.map((stop, idx) => (
                        <Marker key={idx} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={`#${idx + 1} ${stop.name}`} />
                      ))}
                      {tempMarker && <Marker coordinate={tempMarker} pinColor="#1e3a8a" />}
                    </MapView>
                  </View>

                  <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 gap-3">
                    <View>
                      <Text className="text-xs text-gray-500 mb-1 font-medium">Nombre de la Parada</Text>
                      <TextInput value={tempStop.name} onChangeText={(v) => setTempStop({ ...tempStop, name: v })} placeholder="Ej. Puerta Principal UCE" placeholderTextColor="#9ca3af" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-navy-900" />
                    </View>
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1 font-medium">Latitud</Text>
                        <TextInput value={tempStop.latitude} editable={false} placeholder="Toca el mapa" placeholderTextColor="#9ca3af" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-gray-500 mb-1 font-medium">Longitud</Text>
                        <TextInput value={tempStop.longitude} editable={false} placeholder="Toca el mapa" placeholderTextColor="#9ca3af" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-100 text-gray-600" />
                      </View>
                    </View>
                    <Pressable onPress={handleAddTempStop} disabled={!tempStop.name || !tempStop.latitude} className={`w-full py-2 bg-navy-900 rounded-lg flex-row items-center justify-center gap-1.5 ${!tempStop.name || !tempStop.latitude ? 'opacity-40' : 'active:bg-navy-800'}`}>
                      <Plus size={16} color="#ffffff" />
                      <Text className="text-white font-medium text-sm">Insertar Parada en Orden</Text>
                    </Pressable>
                  </View>

                  <View className="border border-gray-100 rounded-xl overflow-hidden bg-white">
                    {newStops.length === 0 ? (
                      <Text className="p-4 text-center text-sm text-gray-400">No se han registrado paradas.</Text>
                    ) : (
                      newStops.map((stop, i) => (
                        <View key={i} className="flex-row items-center gap-3 px-4 py-2.5 border-b border-gray-50">
                          <View className="w-5 h-5 rounded-full bg-navy-900 items-center justify-center">
                            <Text className="text-white text-[11px] font-bold">{i + 1}</Text>
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center gap-1.5">
                              <Text className="text-sm font-semibold text-navy-900">{stop.name}</Text>
                              {stop.id && <Text className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">guardada</Text>}
                            </View>
                            <Text className="text-[11px] text-gray-400">Lat: {stop.latitude} | Lng: {stop.longitude}</Text>
                          </View>
                          <Pressable onPress={() => removeNewStop(i)} className="p-1"><Trash2 size={15} color="#f87171" /></Pressable>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              )}

              {currentStep === 3 && (
                <View className="gap-5">
                  <View className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex-row items-start gap-3">
                    <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                      <CheckCircle size={18} color="#ffffff" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-sm text-emerald-900">¡Geometría de Ruta Consolidada!</Text>
                      <Text className="text-xs text-emerald-700 mt-0.5">El trazado ha sido calculado de forma óptima.</Text>
                    </View>
                  </View>

                  <View className="h-56 rounded-2xl overflow-hidden border border-gray-200">
                    <MapView
                      provider={PROVIDER_DEFAULT}
                      style={{ flex: 1 }}
                      initialRegion={{
                        latitude: newStops[0]?.latitude ?? MAP_CENTER_DEFAULT.latitude,
                        longitude: newStops[0]?.longitude ?? MAP_CENTER_DEFAULT.longitude,
                        latitudeDelta: 0.05, longitudeDelta: 0.05,
                      }}
                    >
                      {newStops.map((stop, idx) => (
                        <Marker key={idx} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={`#${idx + 1} - ${stop.name}`} />
                      ))}
                      {routePolylineRaw ? (
                        <Polyline coordinates={decodePolyline(routePolylineRaw)} strokeColor="#1e3a8a" strokeWidth={5} />
                      ) : null}
                    </MapView>
                  </View>

                  <View className="bg-gray-50 border border-gray-100 rounded-xl p-4 gap-4">
                    <Text className="text-xs font-bold text-navy-900 uppercase">Configurar Bloque de Operación</Text>
                    <View>
                      <Text className="text-[11px] font-semibold text-gray-400 mb-1.5 uppercase">Días del bloque</Text>
                      <View className="flex-row flex-wrap gap-1.5">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSelected = currentGroupDays.includes(day.id);
                          return (
                            <Pressable
                              key={day.id}
                              onPress={() => setCurrentGroupDays((prev) => (isSelected ? prev.filter((d) => d !== day.id) : [...prev, day.id]))}
                              className={`px-3 py-1.5 rounded-lg border ${isSelected ? 'bg-navy-900 border-navy-900' : 'bg-white border-gray-200'}`}
                            >
                              <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}>{day.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>

                    <View>
                      <Text className="text-[11px] font-semibold text-gray-400 mb-1.5 uppercase">Horario de salida (HH:MM:SS)</Text>
                      <View className="flex-row gap-2 mb-2">
                        <TextInput value={tempTime} onChangeText={setTempTime} placeholder="06:00:00" placeholderTextColor="#9ca3af" className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl text-navy-900 flex-1" />
                        <Pressable
                          onPress={() => {
                            if (tempTime && !currentGroupTimes.includes(tempTime)) {
                              setCurrentGroupTimes([...currentGroupTimes, tempTime].sort());
                              setTempTime('');
                            }
                          }}
                          className="px-3 py-1.5 bg-navy-100 rounded-xl justify-center"
                        >
                          <Text className="text-navy-900 font-bold text-xs">Agregar Hora</Text>
                        </Pressable>
                      </View>
                      <View className="flex-row flex-wrap gap-1.5 p-2 bg-white rounded-lg border border-gray-100 min-h-[32px]">
                        {currentGroupTimes.length === 0 && <Text className="text-gray-400 text-xs italic">Ninguna hora añadida</Text>}
                        {currentGroupTimes.map((time) => (
                          <View key={time} className="flex-row items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md">
                            <Clock size={12} color="#9ca3af" />
                            <Text className="text-xs font-medium text-gray-700">{time}</Text>
                            <Pressable onPress={() => setCurrentGroupTimes(currentGroupTimes.filter((t) => t !== time))}>
                              <X size={12} color="#9ca3af" />
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    </View>

                    <Pressable onPress={handleAddScheduleGroup} className="w-full py-2 bg-white border border-navy-900/30 rounded-xl items-center">
                      <Text className="text-navy-900 font-bold text-xs">+ Vincular Bloque de Horarios</Text>
                    </Pressable>
                  </View>

                  <View className="gap-2">
                    <Text className="text-[11px] font-bold text-gray-400 uppercase">Bloques consolidados ({scheduleGroups.length})</Text>
                    {scheduleGroups.length === 0 && (
                      <Text className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">No hay estructuras horarias registradas.</Text>
                    )}
                    {scheduleGroups.map((group, idx) => (
                      <View key={idx} className="flex-row items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                        <View className="flex-1">
                          <Text className="font-bold text-navy-900 text-xs">Días: {group.daysOfWeek.map((d) => DAYS_OF_WEEK.find((day) => day.id === d)?.label).join(', ')}</Text>
                          <Text className="text-gray-500 font-medium text-xs">Salidas: {group.fixedDepartureTimes.join(' | ')}</Text>
                        </View>
                        <Pressable onPress={() => setScheduleGroups(scheduleGroups.filter((_, i) => i !== idx))} className="p-1">
                          <Trash2 size={16} color="#f87171" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {saveError ? (
                <View className="mt-4 bg-red-50 p-3 rounded-lg border border-red-100">
                  <Text className="text-sm text-red-500">{saveError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View className="px-6 py-4 border-t border-gray-100 flex-row justify-between items-center">
              {currentStep > 1 && currentStep < 3 ? (
                <Pressable onPress={() => setCurrentStep((p) => p - 1)} disabled={saving}>
                  <Text className="text-sm font-medium text-gray-600">Anterior</Text>
                </Pressable>
              ) : <View />}

              <View className="flex-row gap-2">
                <Pressable onPress={closeForm} disabled={saving} className="px-4 py-2">
                  <Text className="text-sm font-medium text-gray-500">Cancelar</Text>
                </Pressable>

                {currentStep === 1 && (
                  <Pressable
                    onPress={() => {
                      if (form.name && form.estimatedDurationMinutes) setCurrentStep(2);
                      else setSaveError('Completa los campos obligatorios antes de proceder.');
                    }}
                    className="flex-row items-center gap-1.5 px-5 py-2 bg-navy-900 rounded-xl active:bg-navy-800"
                  >
                    <Text className="text-white text-sm font-semibold">Siguiente</Text>
                    <ChevronRight size={16} color="#ffffff" />
                  </Pressable>
                )}
                {currentStep === 2 && (
                  <Pressable onPress={handleNextFromStep2} disabled={saving} className={`flex-row items-center gap-1.5 px-5 py-2 bg-navy-900 rounded-xl ${saving ? 'opacity-50' : 'active:bg-navy-800'}`}>
                    <Text className="text-white text-sm font-semibold">{saving ? 'Procesando...' : 'Guardar y Continuar'}</Text>
                    <ChevronRight size={16} color="#ffffff" />
                  </Pressable>
                )}
                {currentStep === 3 && (
                  <Pressable onPress={handleFinalizeSchedule} disabled={saving || scheduleGroups.length === 0} className={`flex-row items-center gap-1.5 px-5 py-2 bg-green-600 rounded-xl ${saving || scheduleGroups.length === 0 ? 'opacity-50' : 'active:opacity-90'}`}>
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
