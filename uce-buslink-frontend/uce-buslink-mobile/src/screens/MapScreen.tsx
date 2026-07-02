import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Radio } from 'lucide-react-native';
import { useRoutes } from '../hooks/useRoutes';
import { useRoute } from '../hooks/useRoute';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { useStudentBusTracking } from '../hooks/useStudentBusTracking';
import { RouteTabBar, LeafletMap, RouteMetaCards, MapStopsSidebar } from '../components/molecules';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { routes, loading: routesLoading } = useRoutes();
  const { items: reservations } = useActiveReservations();

  const defaultReservationRouteId =
    reservations.find((item) => item.trip.state === 'ONGOING')?.trip.routeId ??
    reservations[0]?.trip.routeId;

  const [manualSelectedId, setSelectedId] = useState<string>('');
  const selectedId = manualSelectedId || defaultReservationRouteId || routes[0]?.id || '';
  const { route: selectedRoute, loading: routeLoading } = useRoute(selectedId);

  const routeReservations = reservations.filter((item) => item.trip.routeId === selectedId);
  const trackedTripId =
    (routeReservations.find((item) => item.trip.state === 'ONGOING') ?? routeReservations[0])
      ?.trip.id ?? null;
  const { location: liveBus, isConnected } = useStudentBusTracking(trackedTripId);

  const sortedStops = selectedRoute?.stops
    ? [...selectedRoute.stops].sort((a, b) => a.stopOrder - b.stopOrder)
    : [];

  return (
    <ScreenContainer>
      <View className="mb-7">
        <Text className="text-2xl font-bold text-navy-900">Mapa de rutas</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Visualiza el recorrido y las paradas de cada ruta nocturna.
        </Text>

        {trackedTripId && (
          <View
            className={`flex-row self-start items-center gap-2 px-4 py-2 mt-3 rounded-xl border ${
              isConnected && liveBus
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <Radio size={15} color={isConnected && liveBus ? '#047857' : '#b45309'} />
            <Text className={`text-sm font-semibold ${isConnected && liveBus ? 'text-emerald-700' : 'text-amber-700'}`}>
              {liveBus ? 'Bus en vivo' : isConnected ? 'Esperando al bus...' : 'Conectando...'}
            </Text>
          </View>
        )}
      </View>

      <View className="mb-6">
        <RouteTabBar routes={routes} selectedId={selectedId} loading={routesLoading} onSelect={setSelectedId} />
      </View>

      {selectedId && (
        <View className="gap-6">
          <LeafletMap selectedRoute={selectedRoute} loading={routeLoading} liveBus={liveBus} showLocateButton />
          <RouteMetaCards route={selectedRoute} stopsCount={sortedStops.length} />
          <MapStopsSidebar
            stops={sortedStops}
            loading={routeLoading}
            onViewTrips={() => navigation.navigate('RouteDetail', { routeId: selectedId })}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
