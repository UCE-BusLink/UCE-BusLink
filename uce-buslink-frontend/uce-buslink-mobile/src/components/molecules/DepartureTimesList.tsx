import { View, Text, Pressable } from 'react-native';
import { Clock, Armchair } from 'lucide-react-native';
import type { ApiTrip } from '../../types';
import { Spinner } from '../atoms';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

interface DepartureTimesListProps {
  trips: ApiTrip[];
  loading: boolean;
  error?: string | null;
  onSelect?: (trip: ApiTrip) => void;
}

export function DepartureTimesList({ trips, loading, error, onSelect }: DepartureTimesListProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <Text className="text-sm font-semibold text-navy-900 mb-4">Próximas salidas</Text>

      {loading ? (
        <View className="items-center py-6">
          <Spinner />
        </View>
      ) : error ? (
        <Text className="text-sm text-red-400">{error}</Text>
      ) : trips.length === 0 ? (
        <Text className="text-sm text-gray-400">No hay salidas programadas para esta fecha.</Text>
      ) : (
        <View>
          {trips.map((trip) => {
            const hasSpace = trip.availableSeats > 0;
            return (
              <View key={trip.id} className="flex-row items-center justify-between py-3 border-b border-gray-50">
                <View className="flex-row items-center gap-2.5">
                  <Clock size={14} color="#f59e0b" />
                  <Text className="text-sm font-semibold text-navy-900">{formatTime(trip.departureTime)}</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Armchair size={12} color="#9ca3af" />
                    <Text className="text-xs text-gray-400">{trip.availableSeats}</Text>
                  </View>
                  {onSelect && (
                    <Pressable
                      onPress={() => hasSpace && onSelect(trip)}
                      disabled={!hasSpace}
                      className={`px-4 py-1.5 rounded-lg ${hasSpace ? 'bg-navy-900 active:bg-navy-800' : 'bg-gray-100'}`}
                    >
                      <Text className={`text-xs font-semibold ${hasSpace ? 'text-white' : 'text-gray-400'}`}>
                        {hasSpace ? 'Seleccionar lugar' : 'Sin cupos'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
