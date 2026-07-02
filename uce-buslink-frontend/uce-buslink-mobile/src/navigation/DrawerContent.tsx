import { View, Text, Pressable, Image } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bus, Home, Clock, Map, User, LogOut, LayoutDashboard, Truck, MapPin, Settings, Users, CalendarClock,
} from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useCurrentUser } from '../context/AuthContext';
import type { DrawerParamList } from './types';

const brandIcon = require('../../assets/brand/Icon.png');

interface NavItem {
  to: keyof DrawerParamList;
  icon: React.ElementType;
  label: string;
}

const STUDENT_NAV: NavItem[] = [
  { to: 'Dashboard', icon: Home, label: 'Inicio' },
  { to: 'Routes', icon: Bus, label: 'Rutas' },
  { to: 'Trips', icon: Clock, label: 'Viajes' },
  { to: 'Map', icon: Map, label: 'Mapa' },
  { to: 'Profile', icon: User, label: 'Perfil' },
];

const ADMIN_NAV: NavItem[] = [
  { to: 'AdminDashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'AdminMap', icon: Map, label: 'Mapa GPS' },
  { to: 'AdminRoutes', icon: Bus, label: 'Rutas' },
  { to: 'AdminBuses', icon: Truck, label: 'Buses' },
  { to: 'AdminStops', icon: MapPin, label: 'Paradas' },
  { to: 'AdminDrivers', icon: Users, label: 'Choferes' },
  { to: 'AdminTrips', icon: CalendarClock, label: 'Viajes' },
  { to: 'Profile', icon: Settings, label: 'Cuenta' },
];

const DRIVER_NAV: NavItem[] = [
  { to: 'DriverDashboard', icon: Home, label: 'Mis Viajes' },
  { to: 'Profile', icon: User, label: 'Perfil' },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const isDriver = user?.role === 'DRIVER';
  const navItems = isAdmin ? ADMIN_NAV : isDriver ? DRIVER_NAV : STUDENT_NAV;

  const currentRouteName = props.state.routeNames[props.state.index];

  return (
    <View className="flex-1 bg-navy-900" style={{ paddingTop: insets.top }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View className="p-5 pb-4">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center overflow-hidden">
              <Image source={brandIcon} className="w-full h-full" resizeMode="contain" />
            </View>
            <View>
              <Text className="text-white font-bold text-sm">UCE Bus-Link</Text>
              <Text className="text-gray-400 text-xs">{isAdmin ? 'Administración' : isDriver ? 'Conductor' : 'Night Transport'}</Text>
            </View>
          </View>
        </View>

        <View className="px-3 mt-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = currentRouteName === to;
            return (
              <Pressable
                key={to}
                onPress={() => props.navigation.navigate(to)}
                className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-1 ${isActive ? 'bg-white/10 border-l-2 border-amber-400' : ''}`}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#9ca3af'} />
                <Text className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View className="px-3 pb-6" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={() => signOut()}
          className="flex-row items-center gap-3 px-4 py-3 rounded-xl"
        >
          <LogOut size={18} color="#f87171" />
          <Text className="text-sm text-red-400">Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}
