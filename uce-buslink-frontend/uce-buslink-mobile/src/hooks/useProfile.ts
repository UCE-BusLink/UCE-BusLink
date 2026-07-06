import { useQuery } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useCurrentUser } from '../context/AuthContext';
import { getUserProfile } from '../services/api';
import type { UserProfileResponse } from '../types/profile';

export function useProfile() {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const { syncDone } = useCurrentUser();

  return useQuery<UserProfileResponse>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return getUserProfile(token);
    },
    enabled: isLoaded && isSignedIn && syncDone,
    staleTime: 1000 * 60 * 10, // 10 mins
  });
}
