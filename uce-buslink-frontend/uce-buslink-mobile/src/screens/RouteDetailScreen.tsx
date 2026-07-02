import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation, useRoute as useNavRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { AlertCircle } from 'lucide-react-native';
import { getCurrentWeekDays } from '../data/mockData';
import { useRoute } from '../hooks/useRoute';
import { useTripsByRoute } from '../hooks/useTripsByRoute';
import type { RouteStopDetail, StopType, ApiTrip } from '../types';
import {
  EmptyState,
  RouteDetailHeader,
  WeekDayPicker,
  DepartureTimesList,
  RouteStopsList,
  RouteInfoCard,
} from '../components/molecules';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';

export function RouteDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useNavRoute<RouteProp<RootStackParamList, 'RouteDetail'>>();
  const routeId = params.routeId;
  const isAdminContext = !!params.admin;

  const weekDays = getCurrentWeekDays();
  const todayIndex = weekDays.findIndex((d) => d.isToday);
  const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex >= 0 ? todayIndex : 0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { route, loading, error, notFound } = useRoute(routeId);
  const { trips, loading: tripsLoading, error: tripsError } = useTripsByRoute(isAdminContext ? undefined : routeId);

  if (loading) {
    return (
      <ScreenContainer>
        <View className="h-4 bg-gray-100 rounded w-32 mb-6" />
        <View className="h-20 bg-gray-100 rounded-2xl mb-6" />
        <View className="h-40 bg-gray-100 rounded-2xl mb-6" />
        <View className="h-56 bg-gray-100 rounded-2xl" />
      </ScreenContainer>
    );
  }

  if (notFound || !route) {
    return (
      <ScreenContainer>
        <View className="items-center py-20">
          <Text className="mb-4 text-gray-400">Ruta no encontrada.</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text className="text-sm text-navy-900 font-semibold">Volver a rutas</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <EmptyState
          icon={<AlertCircle size={28} color="#f87171" />}
          iconBg="bg-red-50"
          title="No se pudo cargar la ruta"
          description={error}
        />
      </ScreenContainer>
    );
  }

  const stops: RouteStopDetail[] = (route.stops ?? [])
    .slice()
    .sort((a, b) => a.stopOrder - b.stopOrder)
    .map((s, i, arr) => ({
      order: s.stopOrder,
      name: s.stopName,
      type: (i === 0 ? 'origin' : i === arr.length - 1 ? 'destination' : 'stop') as StopType,
      lat: s.latitude,
      lng: s.longitude,
    }));

  function handleSelectTrip(trip: ApiTrip) {
    navigation.navigate('SeatSelection', { routeId, tripId: trip.id });
  }

  return (
    <ScreenContainer>
      <RouteDetailHeader
        backLabel={isAdminContext ? 'Gestión de rutas' : 'Rutas disponibles'}
        onBack={() => navigation.goBack()}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite((v) => !v)}
        onViewMap={() => navigation.navigate('Main', { screen: 'Map' })}
      />

      <WeekDayPicker days={weekDays} selectedIndex={selectedDayIndex} onSelect={setSelectedDayIndex} />

      <View className="gap-6">
        <DepartureTimesList
          trips={trips}
          loading={tripsLoading}
          error={tripsError}
          onSelect={isAdminContext ? undefined : handleSelectTrip}
        />
        <RouteStopsList stops={stops} />
        <RouteInfoCard
          name={route.name}
          isActive={route.isActive}
          estimatedDurationMinutes={route.estimatedDurationMinutes}
          description={route.description}
          stopsCount={stops.length}
          departuresCount={trips.length}
        />
      </View>
    </ScreenContainer>
  );
}
