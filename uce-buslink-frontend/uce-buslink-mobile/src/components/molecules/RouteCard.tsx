import { View, Text } from 'react-native';
import { Bus, Clock } from 'lucide-react-native';
import { Button } from '../atoms/Button';
import type { ApiRoute } from '../../types';

interface RouteCardProps {
  route: ApiRoute;
  onSelect: () => void;
  variant?: 'compact' | 'full';
}

export function RouteCard({ route, onSelect, variant = 'compact' }: RouteCardProps) {
  if (variant === 'full') {
    return (
      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <View className="flex-row items-start justify-between mb-4">
          <Text className="text-lg font-bold text-navy-900 flex-1 pr-2">{route.name}</Text>
          <View className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
            <Bus size={16} color="#4b5563" />
          </View>
        </View>
        {route.description ? (
          <Text className="text-sm text-gray-500 mb-4 leading-relaxed">{route.description}</Text>
        ) : null}
        {route.estimatedDurationMinutes !== null && (
          <View className="flex-row items-center gap-1.5 mb-5">
            <Clock size={14} color="#9ca3af" />
            <Text className="text-sm text-gray-500">{route.estimatedDurationMinutes} min aprox.</Text>
          </View>
        )}
        <Button onPress={onSelect} className="w-full rounded-xl">Ver viajes</Button>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <View className="flex-row items-center gap-2 mb-1.5">
        <View className="w-6 h-6 bg-amber-100 rounded-md items-center justify-center">
          <Bus size={12} color="#d97706" />
        </View>
        <Text className="text-sm font-semibold text-navy-900 flex-1" numberOfLines={1}>{route.name}</Text>
      </View>
      {route.estimatedDurationMinutes !== null && (
        <View className="flex-row items-center gap-1 mb-3">
          <Clock size={11} color="#9ca3af" />
          <Text className="text-xs text-gray-500">{route.estimatedDurationMinutes} min aprox.</Text>
        </View>
      )}
      <Button size="sm" onPress={onSelect} className="w-full py-2">Ver viajes</Button>
    </View>
  );
}
