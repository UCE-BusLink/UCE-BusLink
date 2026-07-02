import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarOff, RefreshCw } from 'lucide-react-native';
import { useDriverTrips } from '../../hooks/useDriverTrips';
import { DriverTripCard } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { RootStackParamList } from '../../navigation/types';

export function DriverDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { trips, loading, error, refetch } = useDriverTrips();

  return (
    <ScreenContainer refreshing={loading} onRefresh={refetch}>
      <View className="flex-row items-center justify-between mb-7">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-bold text-navy-900">Mis viajes</Text>
          <Text className="text-gray-500 text-sm mt-1">Selecciona un viaje para escanear pasajeros.</Text>
        </View>
        <Pressable
          onPress={refetch}
          className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200"
        >
          <RefreshCw size={15} color="#4b5563" />
          <Text className="text-sm font-medium text-gray-600">Recargar</Text>
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center py-12"><Spinner /></View>
      ) : error ? (
        <View className="bg-white rounded-2xl border border-red-100 p-6 items-center">
          <Text className="text-sm text-red-500">{error}</Text>
        </View>
      ) : trips.length === 0 ? (
        <View className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 items-center">
          <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-3">
            <CalendarOff size={24} color="#9ca3af" />
          </View>
          <Text className="font-semibold text-gray-500 mb-1">Sin viajes asignados</Text>
          <Text className="text-sm text-gray-400 text-center">Cuando el administrador te asigne un viaje aparecerá aquí.</Text>
        </View>
      ) : (
        <View>
          {trips.map((trip) => (
            <DriverTripCard
              key={trip.id}
              trip={trip}
              onClick={() => navigation.navigate('DriverTripDetail', { tripId: trip.id })}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
