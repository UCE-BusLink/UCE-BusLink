import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Modal, ScrollView } from 'react-native';
import { User, RefreshCw, Plus, X, Eye, EyeOff, Check } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { fetchDrivers, createDriver, type ApiDriver } from '../../services/adminService';
import { ScreenContainer } from '../../components/layout/ScreenContainer';

const EMPTY_FORM = { nombres: '', apellidos: '', email: '', password: '', confirmPassword: '' };
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
    <View className="flex-row items-center gap-1.5 w-1/2 mb-1">
      <Check size={12} color={ok ? '#16a34a' : '#d1d5db'} />
      <Text className={`text-[11px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>{text}</Text>
    </View>
  );
}

export function AdminDriversScreen() {
  const { getToken } = useAuth();
  const [drivers, setDrivers] = useState<ApiDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
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
        const data = await fetchDrivers(token);
        if (!cancelled) { setDrivers(data); setError(null); }
      } catch {
        if (!cancelled) setError('No se pudieron cargar los choferes.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [getToken, trigger]);

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
    })
      .then(() => { closeForm(); setLoading(true); setTrigger((t) => t + 1); })
      .catch(() => setSaveError('No se pudo crear el chofer. Verifica los datos e intenta de nuevo.'))
      .finally(() => setSaving(false));
  }

  const inputCls = 'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-navy-900';

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between mb-7">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-navy-900">Choferes</Text>
          <Text className="text-gray-500 text-sm mt-1">{drivers.length} registrados</Text>
        </View>
        <Pressable
          onPress={() => setShowForm(true)}
          className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 active:bg-navy-800"
        >
          <Plus size={15} color="#ffffff" />
          <Text className="text-white text-sm font-semibold">Nuevo</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => { setLoading(true); setTrigger((t) => t + 1); }}
        className="flex-row items-center gap-2 self-start px-4 py-2 rounded-xl border border-gray-200 mb-4"
      >
        <RefreshCw size={14} color="#4b5563" />
        <Text className="text-sm text-gray-600">Recargar</Text>
      </Pressable>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <View className="p-6 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className="h-14 bg-gray-50 rounded-xl" />
            ))}
          </View>
        ) : error ? (
          <Text className="p-8 text-center text-red-400 text-sm">{error}</Text>
        ) : drivers.length === 0 ? (
          <Text className="p-8 text-center text-gray-400 text-sm">No hay choferes registrados.</Text>
        ) : (
          drivers.map((driver) => (
            <View key={driver.id} className="flex-row items-center gap-2.5 px-5 py-4 border-b border-gray-50">
              <View className="w-8 h-8 bg-navy-50 rounded-lg items-center justify-center">
                <User size={14} color="#1a3a5c" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-navy-900">{driver.firstName} {driver.lastName}</Text>
                <Text className="text-xs text-gray-500">{driver.email}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={showForm} transparent animationType="slide" onRequestClose={closeForm}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-2xl max-h-[90%]">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
              <Text className="font-semibold text-navy-900">Nuevo chofer</Text>
              <Pressable onPress={closeForm}><X size={18} color="#9ca3af" /></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 24 }}>
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Nombres</Text>
                  <TextInput value={form.nombres} onChangeText={(v) => setForm((f) => ({ ...f, nombres: v }))} placeholder="Daniel" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Apellidos</Text>
                  <TextInput value={form.apellidos} onChangeText={(v) => setForm((f) => ({ ...f, apellidos: v }))} placeholder="Pérez" placeholderTextColor="#9ca3af" className={inputCls} />
                </View>
              </View>

              <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Correo electrónico</Text>
              <TextInput
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                placeholder="chofer@empresa.com"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                keyboardType="email-address"
                className={`w-full px-4 py-2.5 text-sm border rounded-xl text-navy-900 ${emailValid ? 'border-gray-200' : 'border-red-300'}`}
              />
              {!emailValid && <Text className="text-[11px] text-red-400 mt-1">Ingresa un correo válido.</Text>}

              <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5 mt-4">Contraseña temporal</Text>
              <View className="relative justify-center">
                <TextInput
                  value={form.password}
                  onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  className="w-full px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl text-navy-900"
                />
                <Pressable onPress={() => setShowPassword((s) => !s)} className="absolute right-3">
                  {showPassword ? <EyeOff size={16} color="#9ca3af" /> : <Eye size={16} color="#9ca3af" />}
                </Pressable>
              </View>
              {form.password !== '' && (
                <View className="flex-row flex-wrap mt-2">
                  <RuleItem ok={rules.length} text="Al menos 8 caracteres" />
                  <RuleItem ok={rules.upper} text="Una mayúscula" />
                  <RuleItem ok={rules.lower} text="Una minúscula" />
                  <RuleItem ok={rules.number} text="Un número" />
                  <RuleItem ok={rules.special} text="Un carácter especial" />
                </View>
              )}

              <Text className="text-xs font-semibold text-gray-500 uppercase mb-1.5 mt-4">Confirmar contraseña</Text>
              <TextInput
                value={form.confirmPassword}
                onChangeText={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
                placeholder="Repite la contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl text-navy-900 ${confirmValid ? 'border-gray-200' : 'border-red-300'}`}
              />
              {!confirmValid && <Text className="text-[11px] text-red-400 mt-1">Las contraseñas no coinciden.</Text>}

              {saveError ? <Text className="text-xs text-red-400 mt-3">{saveError}</Text> : null}

              <View className="flex-row justify-end gap-2 pt-4">
                <Pressable onPress={closeForm} className="px-4 py-2">
                  <Text className="text-sm font-medium text-gray-500">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreate}
                  disabled={saving || !formValid}
                  className={`px-5 py-2 bg-navy-900 rounded-xl ${saving || !formValid ? 'opacity-50' : 'active:bg-navy-800'}`}
                >
                  <Text className="text-white text-sm font-semibold">{saving ? 'Creando...' : 'Crear chofer'}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
