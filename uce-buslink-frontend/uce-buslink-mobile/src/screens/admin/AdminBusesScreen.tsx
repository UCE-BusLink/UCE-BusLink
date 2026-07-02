import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { Truck, RefreshCw, CheckCircle, Plus, X, Edit2, Trash2 } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import {
  fetchBuses, createBus, updateBus, deleteBus, changeBusStatus, type ApiBus,
} from '../../services/adminService';
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
  { label: 'Operativo', value: 'OPERATIONAL' },
  { label: 'Mantenimiento', value: 'MAINTENANCE' },
  { label: 'Fuera de servicio', value: 'OUT_OF_SERVICE' },
];

const FILTER_OPTIONS = [{ label: 'Todos', value: 'ALL' }, ...STATUS_OPTIONS];

export function AdminBusesScreen() {
  const { getToken } = useAuth();
  const [buses, setBuses] = useState<ApiBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ApiBus | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBuses = buses.filter((bus) =>
    statusFilter === 'ALL' ? true : bus.operationalStatus === statusFilter
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        const page = await fetchBuses(token, 0, 50);
        setBuses(page.content);
        setTotal(page.totalElements);
        setError(null);
      } catch {
        setError('No se pudieron cargar los buses');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
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

  const inputCls = 'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900';

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-navy-900">Buses</Text>
          <Text className="text-gray-500 text-sm mt-1">{total} unidades en flota</Text>
        </View>
        <Pressable onPress={openCreate} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800">
          <Plus size={15} color="#ffffff" />
          <Text className="text-white text-sm font-semibold">Nuevo</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
        <View className="flex-1">
          <Select value={statusFilter} options={FILTER_OPTIONS} onChange={setStatusFilter} />
        </View>
        <Pressable onPress={refresh} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200">
          <RefreshCw size={15} color="#4b5563" />
          <Text className="text-sm text-gray-600">Recargar</Text>
        </Pressable>
      </View>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <View className="p-6 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <View key={i} className="h-14 bg-gray-50 rounded-xl" />)}
          </View>
        ) : error ? (
          <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
        ) : filteredBuses.length === 0 ? (
          <Text className="p-8 text-center text-gray-400 text-sm">No hay buses registrados.</Text>
        ) : (
          filteredBuses.map((bus) => (
            <View key={bus.id} className="px-5 py-4 border-b border-gray-50">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1">
                  <View className="w-8 h-8 bg-amber-50 rounded-lg items-center justify-center">
                    <Truck size={14} color="#d97706" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-navy-900">{bus.plateNumber}</Text>
                    <Text className="text-xs text-gray-500">{bus.internalCode} · {bus.manufacturer} {bus.model} · {bus.seatCapacity} asientos</Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between mt-3">
                <View
                  className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${
                    bus.operationalStatus === 'OPERATIONAL' ? 'bg-green-50'
                      : bus.operationalStatus === 'MAINTENANCE' ? 'bg-yellow-50' : 'bg-red-50'
                  }`}
                >
                  <CheckCircle size={12} color={bus.operationalStatus === 'OPERATIONAL' ? '#16a34a' : bus.operationalStatus === 'MAINTENANCE' ? '#ca8a04' : '#dc2626'} />
                  <Text className={`text-xs font-medium ${bus.operationalStatus === 'OPERATIONAL' ? 'text-green-600' : bus.operationalStatus === 'MAINTENANCE' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {statusLabels[bus.operationalStatus] ?? bus.operationalStatus}
                  </Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <Pressable onPress={() => openEdit(bus)} className="flex-row items-center gap-1">
                    <Edit2 size={13} color="#1a3a5c" />
                    <Text className="text-xs font-medium text-navy-700">Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(bus)} className="flex-row items-center gap-1">
                    <Trash2 size={13} color="#ef4444" />
                    <Text className="text-xs font-medium text-red-500">Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
              <Text className="font-semibold text-navy-900">{editing ? 'Editar bus' : 'Nuevo bus'}</Text>
              <Pressable onPress={closeForm}><X size={18} color="#9ca3af" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
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
                <Select value={form.operationalStatus} options={STATUS_OPTIONS} onChange={(v) => setForm((f) => ({ ...f, operationalStatus: v }))} />
              </View>

              {saveError ? <Text className="text-xs text-red-400">{saveError}</Text> : null}

              <View className="flex-row justify-end gap-2 pt-2">
                <Pressable onPress={closeForm} className="px-4 py-2"><Text className="text-sm font-medium text-gray-500">Cancelar</Text></Pressable>
                <Pressable onPress={handleSubmit} disabled={saving} className={`px-5 py-2 bg-navy-900 rounded-xl ${saving ? 'opacity-50' : 'active:bg-navy-800'}`}>
                  <Text className="text-white text-sm font-semibold">{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear bus'}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
