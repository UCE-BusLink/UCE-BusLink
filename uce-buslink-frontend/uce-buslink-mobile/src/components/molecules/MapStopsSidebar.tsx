import { View, Text, Pressable } from 'react-native';
import { Navigation, Flag, MapPin, Clock, Bus } from 'lucide-react-native';
import type { ApiRouteStop, StopType } from '../../types';
import { deriveStopType } from '../../utils/mapUtils';

const DOT_CLASS: Record<StopType, string> = {
  origin: 'bg-green-500',
  stop: 'bg-navy-700',
  destination: 'bg-amber-500',
};

function StopRow({ stop, type, isLast }: { stop: ApiRouteStop; type: StopType; isLast: boolean }) {
  const label = type === 'origin' ? 'Origen' : type === 'destination' ? 'Destino' : 'Parada';
  const Icon = type === 'origin' ? Navigation : type === 'destination' ? Flag : MapPin;

  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View className={`w-7 h-7 rounded-full items-center justify-center ${DOT_CLASS[type]}`}>
          <Icon size={type === 'stop' ? 11 : 13} color="#ffffff" />
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </View>
      <View className={isLast ? '' : 'pb-6'}>
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text className="text-sm font-semibold text-navy-900">{stop.stopName}</Text>
        {stop.estimatedMinutesFromStart !== null && (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Clock size={10} color="#9ca3af" />
            <Text className="text-xs text-gray-400">{stop.estimatedMinutesFromStart} min desde inicio</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface MapStopsSidebarProps {
  stops: ApiRouteStop[];
  loading: boolean;
  onViewTrips: () => void;
}

export function MapStopsSidebar({ stops, loading, onViewTrips }: MapStopsSidebarProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-sm font-semibold text-navy-900">Paradas de la ruta</Text>
        <Text className="text-xs text-gray-400">{stops.length}</Text>
      </View>

      {stops.length > 0 ? (
        <View>
          {stops.map((stop, i) => (
            <StopRow
              key={stop.stopId}
              stop={stop}
              type={deriveStopType(i, stops.length)}
              isLast={i === stops.length - 1}
            />
          ))}
        </View>
      ) : (
        <Text className="text-sm text-gray-400 text-center py-4">
          {loading ? 'Cargando paradas...' : 'Sin paradas registradas'}
        </Text>
      )}

      <Pressable
        onPress={onViewTrips}
        className="w-full mt-4 py-3 rounded-xl bg-navy-900 active:bg-navy-800 flex-row items-center justify-center gap-1.5"
      >
        <Bus size={15} color="#ffffff" />
        <Text className="text-sm font-semibold text-white">Ver viajes de esta ruta</Text>
      </Pressable>
    </View>
  );
}
