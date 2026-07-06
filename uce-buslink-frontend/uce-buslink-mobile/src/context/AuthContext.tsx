import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { API_URL, CLERK_JWT_TEMPLATE } from '../config/env';
import { Platform } from 'react-native';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { notificationService } from '../services/notificationService';

interface CurrentUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  needsOnboarding: boolean;
}

interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  syncDone: boolean;
  updateOnboardingStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  syncDone: false,
  updateOnboardingStatus: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const syncedRef = useRef(false);
  const [role, setRole] = useState<string>('STUDENT');
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const syncDone = isLoaded && (!clerkUser || syncComplete);
  const { fcmToken } = usePushNotifications();

  const updateOnboardingStatus = (status: boolean) => {
    setNeedsOnboarding(status);
  };

  useEffect(() => {
    if (syncComplete && fcmToken) {
      const registerPushToken = async () => {
        try {
          const token = await getToken({ template: CLERK_JWT_TEMPLATE });
          if (!token) return;
          const platformEnum = Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB';
          await notificationService.registerDevice(token, {
            fcmToken,
            platform: platformEnum
          });
          console.log('Device push token registered successfully');
        } catch (error) {
          console.error('Failed to register device token:', error);
        }
      };
      registerPushToken();
    }
  }, [syncComplete, fcmToken]);

  useEffect(() => {
    if (!isLoaded) return;
    
    // Si no hay usuario (logout), limpiamos los estados para el próximo login
    if (!clerkUser) {
      syncedRef.current = false;
      setRole('STUDENT');
      setNeedsOnboarding(false);
      setSyncComplete(false);
      return;
    }

    if (syncedRef.current) return;
    syncedRef.current = true;

    async function syncToBackend() {
      try {
        const token = await getToken({ template: CLERK_JWT_TEMPLATE });
        if (!token) return;
        const res = await fetch(`${API_URL}/api/v1/auth/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role) setRole(data.role);
          if (data.needsOnboarding !== undefined) setNeedsOnboarding(data.needsOnboarding);
        }
      } catch {
        // silencioso
      } finally {
        setSyncComplete(true);
      }
    }

    syncToBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, clerkUser?.id]);

  const user: CurrentUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        firstName: clerkUser.firstName ?? '',
        lastName: clerkUser.lastName ?? '',
        role,
        needsOnboarding,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, syncDone, updateOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(AuthContext);
}
