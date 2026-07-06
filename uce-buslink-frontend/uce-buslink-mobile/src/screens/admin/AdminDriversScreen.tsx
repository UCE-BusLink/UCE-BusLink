import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import { User, RefreshCw, Plus, X, Eye, EyeOff, Check, Search, ChevronLeft, ChevronRight, Briefcase, Clock, Route as RouteIcon } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { fetchDrivers, createDriver, fetchTrips, type ApiDriver } from '../../services/adminService';
import type { ApiTrip } from '../../types';
import { useRoutes } from '../../hooks/useRoutes';
import { ScreenContainer } from '../../components/layout/ScreenContainer';

const EMPTY_FORM = { nombres: '', apellidos: '', email: '', password: '', confirmPassword: '', cedula: '', telefono: '' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordRules(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function RuleItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View className="flex-row items-center gap-1 w-1/2 mb-1">
      <Check size={12} color={ok ? '#16a34a' : '#d1d5db'} />
      <Text className={`text-[10px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>{text}</Text>
    </View>
  );
}

export function AdminDriversScreen() {
  const { getToken } = useAuth();
  const { routes } = useRoutes();

  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) throw new Error('Sin token');
        
        const [driversData, tripsData] = await Promise.all([
          fetchDrivers(token),
          fetchTrips(token).catch(() => [])
        ]);

        if (!cancelled) {
          setDrivers(driversData);
          setTrips(tripsData);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('No se pudieron cargar los choferes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
      const email = d.email.toLowerCase();
      const s = search.toLowerCase();
      return fullName.includes(s) || email.includes(s);
    });
  }, [drivers, search]);

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const currentDrivers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDrivers.slice(start, start + itemsPerPage);
  }, [filteredDrivers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Form Validation
  const rules = passwordRules(form.password);
  const emailValid = form.email === '' || EMAIL_REGEX.test(form.email);
  const passwordValid = rules.length && rules.upper && rules.lower && rules.number && rules.special;
  const confirmValid = form.confirmPassword === '' || form.confirmPassword === form.password;
  const formValid =
    form.nombres.trim() !== '' &&
    form.apellidos.trim() !== '' &&
    EMAIL_REGEX.test(form.email) &&
    passwordValid &&
    form.confirmPassword === form.password;

  function closeForm() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setSaveError(null);
  }

  // Auto-generar correo y contraseña
  useEffect(() => {
    if (showForm) {
      const nombreLimpio = form.nombres.trim().split(' ')[0] || '';
      const apellidoLimpio = form.apellidos.trim().split(' ')[0] || '';

      if (nombreLimpio || apellidoLimpio) {
        let baseEmail = `${nombreLimpio.toLowerCase()}_${apellidoLimpio.toLowerCase()}_driver@uce.buslink.com`;

        let counter = 1;
        let finalEmail = baseEmail;
        while (drivers.some(d => d.email === finalEmail)) {
          finalEmail = `${nombreLimpio.toLowerCase()}_${apellidoLimpio.toLowerCase()}_driver${counter}@uce.buslink.com`;
          counter++;
        }

        const capitalizedNombre = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1).toLowerCase();
        const capitalizedApellido = apellidoLimpio.charAt(0).toUpperCase() + apellidoLimpio.slice(1).toLowerCase();
        const generatedPassword = `${capitalizedNombre}${capitalizedApellido}2026*`;

        setForm(prev => ({
          ...prev,
          email: finalEmail,
          password: generatedPassword,
          confirmPassword: generatedPassword
        }));
      } else {
        setForm(prev => ({ ...prev, email: '', password: '', confirmPassword: '' }));
      }
    }
  }, [form.nombres, form.apellidos, showForm, drivers]);

  async function handleCreate() {
    setSaveError(null);
    if (!formValid) {
      setSaveError('Revisa los campos: correo válido y contraseña que cumpla los requisitos.');
      return;
    }
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setSaving(true);
    await createDriver(token, {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      email: form.email.trim(),
      password: form.password,
      cedula: form.cedula.trim(),
      telefono: form.telefono.trim(),
    })
      .then(() => { closeForm(); setLoading(true); setTrigger((t) => t + 1); })
      .catch(() => setSaveError('No se pudo crear el chofer. Verifica los datos e intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  function getDriverAssignments(driverId: string) {
    const activeTrips = trips.filter(t => t.driverId === driverId && (t.state === 'SCHEDULED' || t.state === 'IN_PROGRESS' || t.state === 'ONGOING'));
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
    <ScreenContainer>
      <View className="flex-row flex-wrap items-center justify-between mb-5 gap-y-3">
        <View className="flex-1 pr-2 min-w-[200px]">
          <Text className="text-2xl font-bold text-navy-900">Choferes</Text>
          <Text className="text-gray-500 text-sm mt-1">{drivers.length} choferes registrados</Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => { setLoading(true); setTrigger((t) => t + 1); }}
            className="flex-row items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200"
          >
            <RefreshCw size={14} color="#4b5563" />
          </Pressable>
          <Pressable
            onPress={() => setShowForm(true)}
            className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800"
          >
            <Plus size={15} color="#ffffff" />
            <Text className="text-white text-sm font-semibold">Nuevo</Text>
          </Pressable>
        </View>
      </View>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <View className="p-4 border-b border-gray-100 bg-gray-50/50">
          <View className="relative">
            <View className="absolute left-3 top-2.5 z-10"><Search size={16} color="#9ca3af" /></View>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nombre o correo..."
              placeholderTextColor="#9ca3af"
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-navy-900"
            />
          </View>
        </View>

        {loading ? (
          <View className="p-6 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className="h-16 bg-gray-50 rounded-xl" />
            ))}
          </View>
        ) : error ? (
          <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
        ) : currentDrivers.length === 0 ? (
          <Text className="p-8 text-center text-gray-400 text-sm">No se encontraron choferes.</Text>
        ) : (
          <View>
            {currentDrivers.map((driver) => {
              const assignments = getDriverAssignments(driver.id);
              const hasAssignments = assignments.length > 0;
              const primaryAssignment = hasAssignments ? assignments[0] : null;
              const isExpanded = expandedDriverId === driver.id;

              return (
                <View key={driver.id} className="border-b border-gray-50">
                  <Pressable 
                    onPress={() => setExpandedDriverId(isExpanded ? null : driver.id)}
                    className="flex-row items-center justify-between p-4 bg-white active:bg-gray-50"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-10 h-10 bg-navy-50 rounded-xl items-center justify-center">
                        <User size={16} color="#1a3a5c" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-bold text-navy-900">{driver.firstName} {driver.lastName}</Text>
                        <Text className="text-xs text-gray-500" numberOfLines={1}>{driver.email}</Text>
                        <Text className="text-[10px] text-gray-400 mt-0.5">
                          {driver.documentNumber ? `C.I: ${driver.documentNumber}` : 'Sin C.I.'} • {driver.phone || 'Sin Telf.'}
                        </Text>
                      </View>
                    </View>
                    <View className="ml-2">
                      {primaryAssignment ? (
                        <View className="items-end gap-1">
                          <View className="flex-row items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
                            <Briefcase size={10} color="#059669" />
                            <Text className="text-[10px] font-bold text-emerald-800">
                              {primaryAssignment.trip.state === 'ONGOING' || primaryAssignment.trip.state === 'IN_PROGRESS' ? 'En Ruta' : 'Asignado'}
                            </Text>
                          </View>
                          {assignments.length > 1 && (
                            <Text className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">+{assignments.length - 1} viajes</Text>
                          )}
                        </View>
                      ) : (
                        <View className="flex-row items-center gap-1 px-2 py-1 rounded-md bg-gray-100">
                          <Check size={10} color="#9ca3af" />
                          <Text className="text-[10px] font-medium text-gray-500">Disponible</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View className="bg-gray-50 p-4 border-t border-gray-100">
                      <Text className="text-xs font-bold text-navy-900 uppercase mb-2 flex-row items-center">
                        Detalle de Asignaciones ({assignments.length})
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
                                  <Clock size={12} color="#4b5563" /> {asg.timeFormatted}
                                </Text>
                                <Text className="text-[10px] text-gray-500 bg-gray-100 px-1.5 rounded font-mono">
                                  Bus: {asg.trip.busId.substring(0, 6)}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : (
                        <Text className="text-xs text-gray-400 italic">No tiene viajes asignados.</Text>
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
            <Text className="text-xs font-medium text-gray-500">
              Pág. {currentPage} de {totalPages}
            </Text>
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

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-gray-100">
              <Text className="text-lg font-bold text-navy-900">Nuevo chofer</Text>
              <Pressable onPress={closeForm} className="p-1"><X size={20} color="#9ca3af" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5">Nombres</Text>
                  <TextInput value={form.nombres} onChangeText={(v) => setForm((f) => ({ ...f, nombres: v }))} placeholder="Ej. Daniel" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5">Apellidos</Text>
                  <TextInput value={form.apellidos} onChangeText={(v) => setForm((f) => ({ ...f, apellidos: v }))} placeholder="Ej. Pérez" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5">Cédula</Text>
                  <TextInput value={form.cedula} onChangeText={(v) => setForm((f) => ({ ...f, cedula: v }))} placeholder="17xxxxxxxx" keyboardType="numeric" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5">Teléfono</Text>
                  <TextInput value={form.telefono} onChangeText={(v) => setForm((f) => ({ ...f, telefono: v }))} placeholder="09xxxxxxxx" keyboardType="phone-pad" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
              </View>

              <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5">Correo electrónico (Automático)</Text>
              <TextInput
                value={form.email}
                editable={false}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500 mb-4"
              />

              <Text className="text-xs font-bold text-gray-500 uppercase mb-1.5">Contraseña temporal (Automática)</Text>
              <View className="relative justify-center mb-1">
                <TextInput
                  value={form.password}
                  editable={false}
                  secureTextEntry={!showPassword}
                  className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                />
                <Pressable onPress={() => setShowPassword((s) => !s)} className="absolute right-3 p-1">
                  {showPassword ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </Pressable>
              </View>
              
              {form.password !== '' && (
                <View className="flex-row flex-wrap mb-4">
                  <RuleItem ok={rules.length} text="Mínimo 8 caracteres" />
                  <RuleItem ok={rules.upper} text="Una mayúscula" />
                  <RuleItem ok={rules.lower} text="Una minúscula" />
                  <RuleItem ok={rules.special} text="Un carácter especial" />
                </View>
              )}

              {saveError ? <Text className="text-xs text-red-400 mt-2 mb-2 text-center">{saveError}</Text> : null}

              <View className="flex-row gap-3 pt-4 mt-2 border-t border-gray-100 pb-10">
                <Pressable onPress={closeForm} className="flex-1 py-3.5 rounded-xl border border-gray-200 items-center">
                  <Text className="text-sm font-bold text-gray-600">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreate}
                  disabled={saving || !formValid}
                  className={`flex-1 py-3.5 bg-navy-900 rounded-xl items-center ${saving || !formValid ? 'opacity-50' : 'active:bg-navy-800'}`}
                >
                  <Text className="text-white text-sm font-bold">{saving ? 'Creando...' : 'Crear chofer'}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
