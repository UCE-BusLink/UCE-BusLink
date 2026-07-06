import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Eye, EyeOff, Check, AlertTriangle, Lock, Sparkles } from 'lucide-react-native';
import type { UserProfileDto, UpdateUserProfileRequest } from '../../types/profile';
import { useUpdateProfile } from '../../hooks/mutations/useProfileMutations';

interface OnboardingModalProps {
  profile: UserProfileDto;
  onComplete: () => void;
  visible: boolean;
}

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
    <View className="flex-row items-center gap-1.5 mb-1 w-1/2">
      <Check size={12} color={ok ? '#16a34a' : '#9ca3af'} />
      <Text className={`text-[11px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>{text}</Text>
    </View>
  );
}

export function OnboardingModal({ profile, onComplete, visible }: OnboardingModalProps) {
  const mutation = useUpdateProfile();
  const { user } = useUser();
  const [delayedVisible, setDelayedVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setDelayedVisible(true), 400);
      return () => clearTimeout(timer);
    } else {
      setDelayedVisible(false);
    }
  }, [visible]);

  const isDriver = profile.rol === 'DRIVER';

  // State for normal onboarding
  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    telefonoContacto: profile.telefonoContacto || '',
    direccion: profile.direccion || '',
    carrera: profile.carrera || '',
    numeroDocumento: profile.numeroDocumento || '',
    fechaNacimiento: profile.fechaNacimiento || '',
  });

  // State for driver password change
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const rules = passwordRules(passwords.new);
  const passwordValid = rules.length && rules.upper && rules.lower && rules.number && rules.special;
  const confirmValid = passwords.confirm === '' || passwords.confirm === passwords.new;
  const driverFormValid = passwords.current.trim() !== '' && passwordValid && passwords.confirm === passwords.new;

  const handleNormalSubmit = () => {
    mutation.mutate(formData, {
      onSuccess: () => {
        onComplete();
      }
    });
  };

  const handleDriverSubmit = async () => {
    if (!driverFormValid || !user) return;
    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      await user.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      onComplete();
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      setPasswordError(error.errors?.[0]?.longMessage || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!delayedVisible) return null;

  return (
    <View className="absolute inset-0 z-50 flex-1 justify-center bg-black/60 px-4" style={{ elevation: 999 }}>
      <View className="bg-white rounded-2xl shadow-xl overflow-hidden relative max-h-[90%]">

        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <View className="items-center mb-6">
            <View className={`h-16 w-16 rounded-full items-center justify-center shadow-lg ${isDriver ? 'bg-navy-900' : 'bg-blue-600'}`}>
              {isDriver ? <Lock size={32} color="#fff" /> : <Sparkles size={32} color="#fff" />}
            </View>
          </View>

          <Text className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isDriver ? 'Cambio de Contraseña Requerido' : '¡Bienvenido a UCE BusLink!'}
          </Text>
          <Text className="text-center text-gray-500 mb-6 text-sm">
            {isDriver
              ? 'Por seguridad, debes cambiar la contraseña temporal asignada por el administrador antes de continuar.'
              : 'Para ofrecerte la mejor experiencia, necesitamos que completes tu perfil con unos datos adicionales.'}
          </Text>

          {!isDriver ? (
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</Text>
                <TextInput
                  keyboardType="phone-pad"
                  value={formData.telefonoContacto}
                  onChangeText={(v) => setFormData({ ...formData, telefonoContacto: v })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  placeholder="Ej. 0991234567"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Número de Documento (Cédula)</Text>
                <TextInput
                  value={formData.numeroDocumento}
                  onChangeText={(v) => setFormData({ ...formData, numeroDocumento: v })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  placeholder="17xxxxxxxx"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Carrera</Text>
                <TextInput
                  value={formData.carrera}
                  onChangeText={(v) => setFormData({ ...formData, carrera: v })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  placeholder="Ej. Ingeniería en Sistemas"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Dirección Domiciliaria</Text>
                <TextInput
                  value={formData.direccion}
                  onChangeText={(v) => setFormData({ ...formData, direccion: v })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  placeholder="Sector, Calle Principal y Secundaria"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento (YYYY-MM-DD)</Text>
                <TextInput
                  value={formData.fechaNacimiento}
                  onChangeText={(v) => setFormData({ ...formData, fechaNacimiento: v })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  placeholder="2000-01-01"
                />
              </View>

              <View className="pt-4">
                <Pressable
                  onPress={handleNormalSubmit}
                  disabled={mutation.isPending}
                  className="w-full bg-blue-600 active:bg-blue-700 py-3.5 rounded-xl shadow-md items-center justify-center flex-row opacity-100 disabled:opacity-70"
                >
                  {mutation.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-medium text-base">Guardar y Continuar</Text>
                  )}
                </Pressable>
              </View>

              {mutation.isError && (
                <Text className="text-red-500 text-sm text-center mt-2">
                  Ocurrió un error al guardar. Por favor, intenta de nuevo.
                </Text>
              )}
            </View>
          ) : (
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Contraseña Actual</Text>
                <View className="relative justify-center">
                  <TextInput
                    secureTextEntry={!showPassword}
                    value={passwords.current}
                    onChangeText={(v) => setPasswords(p => ({ ...p, current: v }))}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                  <Pressable
                    onPress={() => setShowPassword((s) => !s)}
                    className="absolute right-4"
                  >
                    {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
                  </Pressable>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</Text>
                <View className="relative justify-center">
                  <TextInput
                    secureTextEntry={!showPassword}
                    value={passwords.new}
                    onChangeText={(v) => setPasswords(p => ({ ...p, new: v }))}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-800"
                  />
                </View>
                {passwords.new !== '' && (
                  <View className="mt-2 flex-row flex-wrap">
                    <RuleItem ok={rules.length} text="Al menos 8 caracteres" />
                    <RuleItem ok={rules.upper} text="Una mayúscula" />
                    <RuleItem ok={rules.lower} text="Una minúscula" />
                    <RuleItem ok={rules.number} text="Un número" />
                    <RuleItem ok={rules.special} text="Un carácter especial" />
                  </View>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</Text>
                <TextInput
                  secureTextEntry={!showPassword}
                  value={passwords.confirm}
                  onChangeText={(v) => setPasswords(p => ({ ...p, confirm: v }))}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-800 ${confirmValid ? 'border-gray-200' : 'border-red-300'
                    }`}
                />
                {!confirmValid && <Text className="text-[11px] text-red-500 mt-1">Las contraseñas no coinciden.</Text>}
              </View>

              <View className="pt-4">
                <Pressable
                  onPress={handleDriverSubmit}
                  disabled={isChangingPassword || !driverFormValid}
                  className="w-full bg-navy-900 active:bg-navy-800 py-3.5 rounded-xl shadow-md items-center justify-center flex-row opacity-100 disabled:opacity-70"
                >
                  {isChangingPassword ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-medium text-base">Cambiar y Continuar</Text>
                  )}
                </Pressable>
              </View>

              {passwordError && (
                <View className="bg-red-50 p-3 rounded-xl border border-red-100 flex-row items-center gap-2 mt-3">
                  <AlertTriangle color="#ef4444" size={20} />
                  <Text className="text-red-700 text-xs flex-1">{passwordError}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
