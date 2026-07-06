import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { UserProfileDto, UpdateUserProfileRequest } from '../../types/profile';
import { useUpdateProfile } from '../../hooks/mutations/useProfileMutations';
import { Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

interface OnboardingModalProps {
  profile: UserProfileDto;
  onComplete: () => void;
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
    <li className={`flex items-center gap-1.5 text-[11px] ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      <Check size={12} className={ok ? 'opacity-100' : 'opacity-30'} />
      {text}
    </li>
  );
}

export function OnboardingModal({ profile, onComplete }: OnboardingModalProps) {
  const mutation = useUpdateProfile();
  const { user } = useUser();

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

  const handleNormalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, {
      onSuccess: () => {
        onComplete();
      }
    });
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverFormValid || !user) return;
    setPasswordError(null);
    setIsChangingPassword(true);

    try {
      await user.updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      // Finalizamos el onboarding para el driver sin llamar a la mutación de perfil
      onComplete();
    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);
      setPasswordError(error.errors?.[0]?.longMessage || 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-100 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-indigo-100 opacity-50 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className={`h-16 w-16 ${isDriver ? 'bg-navy-900' : 'bg-blue-600'} text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg`}>
              {isDriver ? '🔒' : '✨'}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            {isDriver ? 'Cambio de Contraseña Requerido' : '¡Bienvenido a UCE BusLink!'}
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            {isDriver 
              ? 'Por seguridad, debes cambiar la contraseña temporal asignada por el administrador antes de continuar.' 
              : 'Para ofrecerte la mejor experiencia, necesitamos que completes tu perfil con unos datos adicionales.'}
          </p>

          {!isDriver ? (
            <form onSubmit={handleNormalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="tel"
                  name="telefonoContacto"
                  required
                  value={formData.telefonoContacto}
                  onChange={(e) => setFormData({ ...formData, telefonoContacto: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ej. 0991234567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento (Cédula)</label>
                <input
                  type="text"
                  name="numeroDocumento"
                  required
                  value={formData.numeroDocumento}
                  onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="17xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                <input
                  type="text"
                  name="carrera"
                  required
                  value={formData.carrera}
                  onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ej. Ingeniería en Sistemas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Domiciliaria</label>
                <input
                  type="text"
                  name="direccion"
                  required
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Sector, Calle Principal y Secundaria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  required
                  value={formData.fechaNacimiento}
                  onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl shadow-md hover:shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {mutation.isPending ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Guardar y Continuar"
                  )}
                </button>
              </div>
              
              {mutation.isError && (
                <p className="text-red-500 text-sm text-center mt-2">
                  Ocurrió un error al guardar. Por favor, intenta de nuevo.
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={handleDriverSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwords.current}
                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                    className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwords.new}
                    onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                    className="w-full px-4 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all"
                  />
                </div>
                {passwords.new !== '' && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                    <RuleItem ok={rules.length} text="Al menos 8 caracteres" />
                    <RuleItem ok={rules.upper} text="Una mayúscula" />
                    <RuleItem ok={rules.lower} text="Una minúscula" />
                    <RuleItem ok={rules.number} text="Un número" />
                    <RuleItem ok={rules.special} text="Un carácter especial" />
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  className={`w-full px-4 py-2 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    confirmValid ? 'border-gray-200 focus:ring-navy-900' : 'border-red-300 focus:ring-red-300'
                  }`}
                />
                {!confirmValid && <p className="text-[11px] text-red-500 mt-1">Las contraseñas no coinciden.</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isChangingPassword || !driverFormValid}
                  className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium py-3 px-4 rounded-xl shadow-md transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isChangingPassword ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Cambiar Contraseña y Continuar"
                  )}
                </button>
              </div>

              {passwordError && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2 mt-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={16} />
                  <p className="text-red-700 text-xs">{passwordError}</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
