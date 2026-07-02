import { View, Text } from 'react-native';
import { Bus, Clock } from 'lucide-react-native';

interface RouteInfoCardProps {
  name: string;
  isActive: boolean;
  estimatedDurationMinutes: number | null;
  description: string | null | undefined;
  stopsCount: number;
  departuresCount: number;
}

export function RouteInfoCard({
  name,
  isActive,
  estimatedDurationMinutes,
  description,
  stopsCount,
  departuresCount,
}: RouteInfoCardProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <View className="bg-navy-900 px-5 pt-5 pb-4">
        <View className="flex-row items-start justify-between mb-1">
          <Text className="font-bold text-white flex-1">{name}</Text>
          <View className="flex-row items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full ml-2">
            <Bus size={11} color="rgba(255,255,255,0.7)" />
            <Text className="text-xs text-white/70 font-medium">{isActive ? 'Activa' : 'Inactiva'}</Text>
          </View>
        </View>
        {estimatedDurationMinutes !== null && (
          <View className="flex-row items-center gap-1">
            <Clock size={11} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/50 text-xs">{estimatedDurationMinutes} min aprox.</Text>
          </View>
        )}
      </View>
      <View className="p-5">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Descripción</Text>
        <Text className="text-sm text-gray-600 leading-relaxed mb-5">
          {description ?? 'Esta ruta no tiene una descripción registrada.'}
        </Text>
        <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
          <Text className="text-xs text-gray-400">Paradas</Text>
          <Text className="text-sm font-semibold text-navy-900">{stopsCount}</Text>
        </View>
        <View className="flex-row items-center justify-between pt-3">
          <Text className="text-xs text-gray-400">Salidas diarias</Text>
          <Text className="text-sm font-semibold text-navy-900">{departuresCount}</Text>
        </View>
      </View>
    </View>
  );
}
