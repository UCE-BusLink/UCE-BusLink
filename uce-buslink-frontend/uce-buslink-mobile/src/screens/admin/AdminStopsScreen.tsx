import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { MapPin, RefreshCw, CheckCircle, XCircle, Plus, X, Edit2, Trash2 } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import {
  fetchStops, createStop, updateStop, deleteStop, toggleStopStatus, type ApiStop,
} from '../../services/adminService';
import { ScreenContainer } from '../../components/layout/ScreenContainer';

const MAP_CENTER = { latitude: -0.1989, longitude: -78.5065 };

export function AdminStopsScreen() {
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

  function refresh() { setLoading(true); setTrigger((t) => t + 1); }

  function openCreate() {
    setEditing(null); setFormName(''); setFormLat(''); setFormLng(''); setFormError(null); setShowModal(true);
  }
  function openEdit(stop: ApiStop) {
    setEditing(stop); setFormName(stop.name); setFormLat(String(stop.latitude)); setFormLng(String(stop.longitude)); setFormError(null); setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditing(null); setFormError(null); }

  async function handleSave() {
    if (!formName || !formLat || !formLng) { setFormError('Completa todos los campos.'); return; }
    setSaving(true); setFormError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No autorizado');
      const payload = { name: formName, latitude: parseFloat(formLat), longitude: parseFloat(formLng) };
      if (editing) await updateStop(token, editing.id, payload);
      else await createStop(token, payload);
      closeModal(); refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(stop: ApiStop) {
    Alert.alert('Eliminar parada', `¿Eliminar la parada "${stop.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            const token = await getToken({ template: 'uce-buslink' });
            if (!token) return;
            await deleteStop(token, stop.id); refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar');
          }
        },
      },
    ]);
  }

  async function handleToggle(stop: ApiStop) {
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      await toggleStopStatus(token, stop.id, !stop.isActive); refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado');
    }
  }

  const filtered = stops.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
  const markerPos = formLat && formLng ? { latitude: parseFloat(formLat), longitude: parseFloat(formLng) } : null;

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-navy-900">Paradas</Text>
          <Text className="text-gray-500 text-sm mt-1">{stops.length} registradas</Text>
        </View>
        <Pressable onPress={openCreate} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800">
          <Plus size={15} color="#ffffff" />
          <Text className="text-white text-sm font-semibold">Nueva</Text>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar parada..."
          placeholderTextColor="#9ca3af"
          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900"
        />
        <Pressable onPress={refresh} className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200">
          <RefreshCw size={15} color="#4b5563" />
          <Text className="text-sm text-gray-600">Recargar</Text>
        </Pressable>
      </View>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <View className="p-6 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <View key={i} className="h-12 bg-gray-50 rounded-xl" />)}
          </View>
        ) : error ? (
          <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
        ) : filtered.length === 0 ? (
          <Text className="p-8 text-center text-gray-400 text-sm">No se encontraron paradas.</Text>
        ) : (
          filtered.map((stop) => (
            <View key={stop.id} className="px-5 py-4 border-b border-gray-50">
              <View className="flex-row items-center gap-2.5">
                <View className="w-7 h-7 bg-green-50 rounded-lg items-center justify-center">
                  <MapPin size={13} color="#16a34a" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-navy-900">{stop.name}</Text>
                  <Text className="text-xs text-gray-500">{stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mt-3">
                <Pressable onPress={() => handleToggle(stop)}>
                  {stop.isActive ? (
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
                </Pressable>
                <View className="flex-row items-center gap-3">
                  <Pressable onPress={() => openEdit(stop)} className="flex-row items-center gap-1">
                    <Edit2 size={13} color="#1a3a5c" />
                    <Text className="text-xs font-medium text-navy-700">Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(stop)} className="flex-row items-center gap-1">
                    <Trash2 size={13} color="#ef4444" />
                    <Text className="text-xs font-medium text-red-500">Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl max-h-[90%]">
            <View className="px-6 py-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="font-bold text-lg text-navy-900">{editing ? 'Editar Parada' : 'Nueva Parada'}</Text>
              <Pressable onPress={closeModal}><X size={20} color="#9ca3af" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              <View className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4">
                <Text className="text-xs text-blue-800">Toca el mapa para fijar las coordenadas automáticamente.</Text>
              </View>

              <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Nombre</Text>
              <TextInput
                value={formName}
                onChangeText={setFormName}
                placeholder="Ej. Puerta Principal UCE"
                placeholderTextColor="#9ca3af"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900 mb-4"
              />

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Latitud</Text>
                  <TextInput value={formLat} editable={false} placeholder="Toca el mapa" placeholderTextColor="#9ca3af" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-600" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Longitud</Text>
                  <TextInput value={formLng} editable={false} placeholder="Toca el mapa" placeholderTextColor="#9ca3af" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-600" />
                </View>
              </View>

              {formError ? (
                <Text className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-4">{formError}</Text>
              ) : null}

              <View className="h-64 rounded-xl overflow-hidden border border-gray-200 mb-4">
                <MapView
                  provider={PROVIDER_DEFAULT}
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: markerPos?.latitude ?? MAP_CENTER.latitude,
                    longitude: markerPos?.longitude ?? MAP_CENTER.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                  }}
                  onPress={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setFormLat(latitude.toFixed(6));
                    setFormLng(longitude.toFixed(6));
                  }}
                >
                  {markerPos && <Marker coordinate={markerPos} />}
                </MapView>
              </View>

              <View className="flex-row justify-end gap-3">
                <Pressable onPress={closeModal} className="px-4 py-2"><Text className="text-sm text-gray-500">Cancelar</Text></Pressable>
                <Pressable onPress={handleSave} disabled={saving} className={`px-5 py-2 bg-navy-900 rounded-xl ${saving ? 'opacity-50' : 'active:bg-navy-800'}`}>
                  <Text className="text-white text-sm font-semibold">{saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Parada'}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
