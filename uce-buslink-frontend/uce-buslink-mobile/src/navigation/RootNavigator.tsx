import { View, ActivityIndicator, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@clerk/clerk-expo';
import { useCurrentUser } from '../context/AuthContext';
import { MainDrawer } from './MainDrawer';
import { RouteDetailScreen } from '../screens/RouteDetailScreen';
import { SeatSelectionScreen } from '../screens/SeatSelectionScreen';
import { DriverTripDetailScreen } from '../screens/driver/DriverTripDetailScreen';
import { LandingScreen } from '../screens/auth/LandingScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { OnboardingModal } from '../components/organisms/OnboardingModal';
import { useProfile } from '../hooks/useProfile';
import { useRealtimeRoutes } from '../hooks/useRealtimeRoutes';
import type { RootStackParamList, AuthStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function LoadingScreen({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#0a1628" />
      <Text className="text-sm text-gray-500 mt-3">{label}</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { user, updateOnboardingStatus } = useCurrentUser();
  const { data: profile, refetch } = useProfile();
  useRealtimeRoutes();

  return (
    <>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#0a1628',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <RootStack.Screen name="Main" component={MainDrawer} options={{ headerShown: false }} />
        <RootStack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Detalle de ruta' }} />
        <RootStack.Screen name="SeatSelection" component={SeatSelectionScreen} options={{ title: 'Reservar lugar' }} />
        <RootStack.Screen name="DriverTripDetail" component={DriverTripDetailScreen} options={{ title: 'Detalle del viaje' }} />
      </RootStack.Navigator>
      
      {user?.needsOnboarding && profile && (
        <OnboardingModal 
          visible={true}
          profile={profile.usuario} 
          onComplete={() => {
            refetch();
            updateOnboardingStatus(false);
          }} 
        />
      )}
    </>
  );
}

export function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { syncDone } = useCurrentUser();

  if (!isLoaded) {
    return <LoadingScreen label="Cargando sesión..." />;
  }

  if (isSignedIn && !syncDone) {
    return <LoadingScreen label="Sincronizando cuenta..." />;
  }

  return isSignedIn ? <AppNavigator /> : <AuthNavigator />;
}
