import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, Star, Map as MapIcon } from 'lucide-react-native';

interface RouteDetailHeaderProps {
  backLabel: string;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewMap: () => void;
}

export function RouteDetailHeader({
  backLabel,
  onBack,
  isFavorite,
  onToggleFavorite,
  onViewMap,
}: RouteDetailHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-5">
      <Pressable onPress={onBack} className="flex-row items-center gap-1">
        <ChevronLeft size={16} color="#6b7280" />
        <Text className="text-sm text-gray-500">{backLabel}</Text>
      </Pressable>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onToggleFavorite}
          className={`flex-row items-center gap-2 rounded-xl px-4 py-2.5 border ${
            isFavorite ? 'bg-amber-50 border-amber-200' : 'border-gray-200'
          }`}
        >
          <Star size={16} color={isFavorite ? '#f59e0b' : '#4b5563'} fill={isFavorite ? '#f59e0b' : 'none'} />
          <Text className={`text-sm font-medium ${isFavorite ? 'text-amber-600' : 'text-gray-600'}`}>
            {isFavorite ? 'En favoritos' : 'Favoritos'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onViewMap}
          className="flex-row items-center gap-2 rounded-xl px-4 py-2.5 bg-navy-900 active:bg-navy-800"
        >
          <MapIcon size={16} color="#ffffff" />
          <Text className="text-sm font-semibold text-white">Ver en mapa</Text>
        </Pressable>
      </View>
    </View>
  );
}
