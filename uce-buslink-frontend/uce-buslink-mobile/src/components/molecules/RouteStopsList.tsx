import { View, Text } from 'react-native';
import { StopRow } from './StopRow';
import type { RouteStopDetail } from '../../types';

interface RouteStopsListProps {
  stops: RouteStopDetail[];
}

export function RouteStopsList({ stops }: RouteStopsListProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <View className="flex-row items-center justify-between mb-5">
        <Text className="text-sm font-semibold text-navy-900">Paradas de la ruta</Text>
        <Text className="text-xs text-gray-400">{stops.length} paradas</Text>
      </View>
      <View>
        {stops.map((stop, i) => (
          <StopRow
            key={`${stop.order}-${stop.name}`}
            stop={stop}
            isLast={i === stops.length - 1}
          />
        ))}
      </View>
    </View>
  );
}
