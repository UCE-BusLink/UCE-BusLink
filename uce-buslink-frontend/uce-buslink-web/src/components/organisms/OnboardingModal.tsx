import React, { useState } from 'react';
import type { UserProfileDto, UpdateUserProfileRequest } from '../../types/profile';
import { updateUserProfile } from '../../services/api';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface OnboardingModalProps {
  profile: UserProfileDto;
  onComplete: () => void;
}

export function OnboardingModal({ profile, onComplete }: OnboardingModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateUserProfileRequest>({
    telefonoContacto: profile.telefonoContacto || '',
    direccion: profile.direccion || '',
    carrera: profile.carrera || '',
    numeroDocumento: profile.numeroDocumento || '',
    fechaNacimiento: profile.fechaNacimiento || '',
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateUserProfileRequest) => {
      const token = await getToken({ template: "uce-buslink" });
      if (!token) throw new Error('No token');
      return updateUserProfile(token, data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile'], data);
      onComplete();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-100 opacity-50 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-indigo-100 opacity-50 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
              ✨
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">¡Bienvenido a UCE BusLink!</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Para ofrecerte la mejor experiencia, necesitamos que completes tu perfil con unos datos adicionales.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
              <input
                type="tel"
                name="telefonoContacto"
                required
                value={formData.telefonoContacto}
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
                onChange={handleChange}
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
        </div>
      </div>
    </div>
  );
}
