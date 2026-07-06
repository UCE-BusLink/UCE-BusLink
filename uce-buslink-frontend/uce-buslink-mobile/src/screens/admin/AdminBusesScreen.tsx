import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { Truck, RefreshCw, CheckCircle, Plus, X, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Briefcase, Clock, Route as RouteIcon } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import {
  fetchBuses, createBus, updateBus, deleteBus, changeBusStatus, fetchTrips, type ApiBus
} from '../../services/adminService';
import type { ApiTrip } from '../../types';
import { useRoutes } from '../../hooks/useRoutes';
import { Select } from '../../components/atoms';
import { ScreenContainer } from '../../components/layout/ScreenContainer';

const EMPTY_FORM = {
  plateNumber: '',
  internalCode: '',
  seatCapacity: '',
  manufacturer: '',
  model: '',
  operationalStatus: 'OPERATIONAL',
};

const statusLabels: Record<string, string> = {
  OPERATIONAL: 'Operativo',
  MAINTENANCE: 'Mantenimiento',
  OUT_OF_SERVICE: 'Fuera de servicio',
};

const STATUS_OPTIONS = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Operativo', value: 'OPERATIONAL' },
  { label: 'Mantenimiento', value: 'MAINTENANCE' },
  { label: 'Fuera de servicio', value: 'OUT_OF_SERVICE' },
];

const FORM_STATUS_OPTIONS = [
  { label: 'Operativo', value: 'OPERATIONAL' },
  { label: 'Mantenimiento', value: 'MAINTENANCE' },
  { label: 'Fuera de servicio', value: 'OUT_OF_SERVICE' },
];

export function AdminBusesScreen() {
  const { getToken } = useAuth();
  const { routes } = useRoutes();

  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiBus | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        
        const [pageData, tripsData] = await Promise.all([
          fetchBuses(token, 0, 500),
          fetchTrips(token).catch(() => [])
        ]);

        if (!cancelled) {
          setBuses(pageData.content);
          setTrips(tripsData);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar los datos de los buses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  function refresh() {
    setLoading(true);
    setError(null);
    setTrigger((t) => t + 1);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
    setShowForm(true);
  }

  function openEdit(bus: ApiBus) {
    setEditing(bus);
    setForm({
      plateNumber: bus.plateNumber,
      internalCode: bus.internalCode,
      seatCapacity: String(bus.seatCapacity),
      manufacturer: bus.manufacturer,
      model: bus.model,
      operationalStatus: bus.operationalStatus,
    });
    setSaveError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveError(null);
  }

  async function handleSubmit() {
    setSaveError(null);
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    try {
      const data = {
        plateNumber: form.plateNumber.trim(),
        internalCode: form.internalCode.trim(),
        seatCapacity: Number(form.seatCapacity),
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
      };
      if (editing) {
        await updateBus(token, editing.id, data);
        if (form.operationalStatus !== editing.operationalStatus) {
          await changeBusStatus(token, editing.id, form.operationalStatus);
        }
      } else {
        await createBus(token, { ...data, operationalStatus: form.operationalStatus });
      }
      closeForm();
      refresh();
    } catch {
      setSaveError('No se pudo guardar el bus. Verifica los datos e intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(bus: ApiBus) {
    Alert.alert('Eliminar bus', `¿Eliminar el bus "${bus.plateNumber}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken({ template: 'uce-buslink' });
            if (!token) return;
            await deleteBus(token, bus.id);
            refresh();
          } catch {
            setError('No se pudo eliminar el bus.');
          }
        },
      },
    ]);
  }

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const matchStatus = statusFilter === 'ALL' || bus.operationalStatus === statusFilter;
      const term = search.toLowerCase();
      const matchSearch = bus.plateNumber.toLowerCase().includes(term) || bus.internalCode.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [buses, statusFilter, search]);

  const totalPages = Math.ceil(filteredBuses.length / itemsPerPage);
  const currentBuses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBuses.slice(start, start + itemsPerPage);
  }, [filteredBuses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  function getBusAssignments(busId: string) {
    const activeTrips = trips.filter(t => t.busId === busId && (t.state === 'SCHEDULED' || t.state === 'IN_PROGRESS' || t.state === 'ONGOING'));
    if (activeTrips.length === 0) return [];
    
    return activeTrips.map(trip => {
      const route = routes.find(r => r.id === trip.routeId);
      const d = new Date(trip.departureTime);
      return {
        trip,
        route,
        timeFormatted: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      };
    });
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900 bg-white';

  return (
    <ScreenContainer scroll={false}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="flex-row flex-wrap items-center justify-between mb-5 gap-y-3">
          <View className="flex-1 pr-2 min-w-[200px]">
            <Text className="text-2xl font-bold text-navy-900">Buses</Text>
            <Text className="text-gray-500 text-sm mt-1">{buses.length} unidades en flota</Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable onPress={refresh} className="flex-row items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200">
              <RefreshCw size={14} color="#4b5563" />
            </Pressable>
            <Pressable onPress={openCreate} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800">
              <Plus size={15} color="#ffffff" />
              <Text className="text-white text-sm font-semibold">Nuevo</Text>
            </Pressable>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <View className="p-4 border-b border-gray-100 bg-gray-50/50 gap-3">
            <View className="relative">
              <View className="absolute left-3 top-2.5 z-10"><Search size={16} color="#9ca3af" /></View>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por placa o código..."
                placeholderTextColor="#9ca3af"
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-navy-900"
              />
            </View>
            <Select value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
          </View>

          {loading ? (
            <View className="p-6 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <View key={i} className="h-16 bg-gray-50 rounded-xl" />)}
            </View>
          ) : error ? (
            <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
          ) : currentBuses.length === 0 ? (
            <Text className="p-8 text-center text-gray-400 text-sm">No se encontraron buses con estos filtros.</Text>
          ) : (
            <View>
              {currentBuses.map((bus) => {
                const assignments = getBusAssignments(bus.id);
                const hasAssignments = assignments.length > 0;
                const primaryAssignment = hasAssignments ? assignments[0] : null;
                const isExpanded = expandedBusId === bus.id;

                return (
                  <View key={bus.id} className="border-b border-gray-50">
                    <Pressable
                      onPress={() => setExpandedBusId(isExpanded ? null : bus.id)}
                      className="p-4 bg-white active:bg-gray-50"
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center">
                            <Truck size={16} color="#d97706" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-bold text-navy-900">{bus.plateNumber}</Text>
                            <Text className="text-[11px] text-gray-500 font-mono mt-0.5">Cod: {bus.internalCode}</Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="text-sm font-semibold text-gray-700">{bus.seatCapacity} asnts.</Text>
                          <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>{bus.manufacturer} {bus.model}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                            bus.operationalStatus === 'OPERATIONAL' ? 'bg-green-50' : bus.operationalStatus === 'MAINTENANCE' ? 'bg-yellow-50' : 'bg-red-50'
                          }`}>
                            <CheckCircle size={10} color={bus.operationalStatus === 'OPERATIONAL' ? '#16a34a' : bus.operationalStatus === 'MAINTENANCE' ? '#ca8a04' : '#dc2626'} />
                            <Text className={`text-[10px] font-bold ${bus.operationalStatus === 'OPERATIONAL' ? 'text-green-700' : bus.operationalStatus === 'MAINTENANCE' ? 'text-yellow-700' : 'text-red-700'}`}>
                              {statusLabels[bus.operationalStatus] ?? bus.operationalStatus}
                            </Text>
                          </View>
                          
                          {primaryAssignment ? (
                            <View className="flex-row items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                              <Briefcase size={10} color="#059669" />
                              <Text className="text-[10px] font-bold text-emerald-800">
                                {primaryAssignment.trip.state === 'ONGOING' || primaryAssignment.trip.state === 'IN_PROGRESS' ? 'En Ruta' : 'Asignado'}
                              </Text>
                              {assignments.length > 1 && (
                                <Text className="text-[9px] font-bold text-emerald-700 ml-1">+{assignments.length - 1}</Text>
                              )}
                            </View>
                          ) : (
                            <View className="flex-row items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
                              <CheckCircle size={10} color="#9ca3af" />
                              <Text className="text-[10px] font-medium text-gray-500">Disponible</Text>
                            </View>
                          )}
                        </View>

                        <View className="flex-row items-center gap-3">
                          <Pressable onPress={() => openEdit(bus)} className="p-1">
                            <Edit2 size={16} color="#1a3a5c" />
                          </Pressable>
                          <Pressable onPress={() => handleDelete(bus)} className="p-1">
                            <Trash2 size={16} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>

                    {isExpanded && (
                      <View className="bg-gray-50 p-4 border-t border-gray-100">
                        <Text className="text-xs font-bold text-navy-900 uppercase mb-2">
                          Itinerario del Bus ({assignments.length})
                        </Text>
                        {hasAssignments ? (
                          <View className="gap-2">
                            {assignments.map((asg) => (
                              <View key={asg.trip.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                                <View className="flex-row items-center justify-between mb-1">
                                  <Text className="text-xs font-bold text-navy-900 flex-row items-center gap-1 flex-1" numberOfLines={1}>
                                    <RouteIcon size={12} color="#1a3a5c" /> {asg.route?.name || 'Ruta'}
                                  </Text>
                                  <Text className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${asg.trip.state === 'ONGOING' || asg.trip.state === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {asg.trip.state === 'ONGOING' || asg.trip.state === 'IN_PROGRESS' ? 'EN CURSO' : 'PROGRAMADO'}
                                  </Text>
                                </View>
                                <View className="flex-row items-center justify-between mt-1">
                                  <Text className="text-xs text-gray-600 flex-row items-center gap-1">
                                    <Clock size={12} color="#4b5563" /> Salida: {asg.timeFormatted}
                                  </Text>
                                  <Text className="text-[10px] text-gray-500">Chofer: {asg.trip.driverId.substring(0, 6)}</Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <Text className="text-xs text-gray-400 italic">No tiene viajes programados.</Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {totalPages > 1 && (
            <View className="p-4 border-t border-gray-100 flex-row items-center justify-between bg-gray-50/50">
              <Text className="text-xs font-medium text-gray-500">Pág. {currentPage} de {totalPages}</Text>
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-1.5 rounded-lg border border-gray-200 ${currentPage === 1 ? 'opacity-40' : 'bg-white'}`}
                >
                  <ChevronLeft size={16} color="#4b5563" />
                </Pressable>
                <Pressable
                  onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 rounded-lg border border-gray-200 ${currentPage === totalPages ? 'opacity-40' : 'bg-white'}`}
                >
                  <ChevronRight size={16} color="#4b5563" />
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
              <Text className="font-semibold text-lg text-navy-900">{editing ? 'Editar bus' : 'Nuevo bus'}</Text>
              <Pressable onPress={closeForm} className="p-1"><X size={20} color="#9ca3af" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Placa</Text>
                  <TextInput value={form.plateNumber} onChangeText={(v) => setForm((f) => ({ ...f, plateNumber: v }))} placeholder="PXX-0001" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Código interno</Text>
                  <TextInput value={form.internalCode} onChangeText={(v) => setForm((f) => ({ ...f, internalCode: v }))} placeholder="BUS-001" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
              </View>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Fabricante</Text>
                  <TextInput value={form.manufacturer} onChangeText={(v) => setForm((f) => ({ ...f, manufacturer: v }))} placeholder="Volkswagen" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Modelo</Text>
                  <TextInput value={form.model} onChangeText={(v) => setForm((f) => ({ ...f, model: v }))} placeholder="Volksbus" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
              </View>
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Capacidad de asientos</Text>
                <TextInput value={form.seatCapacity} onChangeText={(v) => setForm((f) => ({ ...f, seatCapacity: v }))} placeholder="30" placeholderTextColor="#9ca3af" keyboardType="number-pad" className={inputCls} />
              </View>
              <View className="mb-4">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Estado</Text>
                <Select value={form.operationalStatus} options={FORM_STATUS_OPTIONS} onChange={(v) => setForm((f) => ({ ...f, operationalStatus: v }))} />
              </View>

              {saveError ? <Text className="text-xs text-red-400 mt-2 mb-2 text-center">{saveError}</Text> : null}

              <View className="flex-row gap-3 pt-4 mt-2 border-t border-gray-100 pb-10">
                <Pressable onPress={closeForm} className="flex-1 py-3.5 rounded-xl border border-gray-200 items-center">
                  <Text className="text-sm font-bold text-gray-600">Cancelar</Text>
                </Pressable>
                <Pressable onPress={handleSubmit} disabled={saving} className={`flex-1 py-3.5 bg-navy-900 rounded-xl items-center ${saving ? 'opacity-50' : 'active:bg-navy-800'}`}>
                  <Text className="text-white text-sm font-bold">{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear bus'}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
