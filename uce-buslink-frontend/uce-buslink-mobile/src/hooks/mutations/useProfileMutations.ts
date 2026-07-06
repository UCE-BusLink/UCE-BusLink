import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { updateUserProfile } from '../../services/api';
import type { UpdateUserProfileRequest, UserProfileResponse } from '../../types/profile';
import { Alert } from 'react-native';

export function useUpdateProfile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserProfileRequest) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return updateUserProfile(token, data);
    },
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['userProfile'] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfileResponse>(['userProfile']);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<UserProfileResponse>(['userProfile'], {
          ...previousProfile,
          usuario: {
            ...previousProfile.usuario,
            carrera: newProfileData.carrera || previousProfile.usuario.carrera,
            telefonoContacto: newProfileData.telefonoContacto || previousProfile.usuario.telefonoContacto,
            direccion: newProfileData.direccion || previousProfile.usuario.direccion,
            numeroDocumento: newProfileData.numeroDocumento || previousProfile.usuario.numeroDocumento,
            fechaNacimiento: newProfileData.fechaNacimiento || previousProfile.usuario.fechaNacimiento,
          }
        });
      }

      return { previousProfile };
    },
    onError: (_err, _newProfileData, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousProfile) {
        queryClient.setQueryData(['userProfile'], context.previousProfile);
      }
      Alert.alert('Error', 'No se pudo actualizar el perfil. Inténtalo de nuevo.');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onSuccess: () => {
      // Éxito
    },
  });
}
