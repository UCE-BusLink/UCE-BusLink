import { createDrawerNavigator } from '@react-navigation/drawer';
import { useCurrentUser } from '../context/AuthContext';
import { DrawerContent } from './DrawerContent';
import { HeaderUserButton } from '../components/layout/HeaderUserButton';
import type { DrawerParamList } from './types';

import { DashboardScreen } from '../screens/DashboardScreen';
import { RoutesScreen } from '../screens/RoutesScreen';
import { TripsScreen } from '../screens/TripsScreen';
import { MapScreen } from '../screens/MapScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { DriverDashboardScreen } from '../screens/driver/DriverDashboardScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminMapScreen } from '../screens/admin/AdminMapScreen';
import { AdminRoutesScreen } from '../screens/admin/AdminRoutesScreen';
import { AdminBusesScreen } from '../screens/admin/AdminBusesScreen';
import { AdminStopsScreen } from '../screens/admin/AdminStopsScreen';
import { AdminDriversScreen } from '../screens/admin/AdminDriversScreen';
import { AdminTripsScreen } from '../screens/admin/AdminTripsScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

export function MainDrawer() {
  const { user } = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const isDriver = user?.role === 'DRIVER';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0a1628',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <HeaderUserButton />,
        drawerStyle: { width: 260 },
        swipeEdgeWidth: 60,
      }}
    >
      {isAdmin ? (
        <>
          <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Dashboard' }} />
          <Drawer.Screen name="AdminMap" component={AdminMapScreen} options={{ title: 'Mapa GPS' }} />
          <Drawer.Screen name="AdminRoutes" component={AdminRoutesScreen} options={{ title: 'Rutas' }} />
          <Drawer.Screen name="AdminBuses" component={AdminBusesScreen} options={{ title: 'Buses' }} />
          <Drawer.Screen name="AdminStops" component={AdminStopsScreen} options={{ title: 'Paradas' }} />
          <Drawer.Screen name="AdminDrivers" component={AdminDriversScreen} options={{ title: 'Choferes' }} />
          <Drawer.Screen name="AdminTrips" component={AdminTripsScreen} options={{ title: 'Viajes' }} />
          <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Cuenta' }} />
        </>
      ) : isDriver ? (
        <>
          <Drawer.Screen name="DriverDashboard" component={DriverDashboardScreen} options={{ title: 'Mis Viajes' }} />
          <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
        </>
      ) : (
        <>
          <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
          <Drawer.Screen name="Routes" component={RoutesScreen} options={{ title: 'Rutas' }} />
          <Drawer.Screen name="Trips" component={TripsScreen} options={{ title: 'Viajes' }} />
          <Drawer.Screen name="Map" component={MapScreen} options={{ title: 'Mapa' }} />
          <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
        </>
      )}
    </Drawer.Navigator>
  );
}
