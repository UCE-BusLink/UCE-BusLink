import { View, Text } from 'react-native';
import { Clock, MapPin, User, Hash } from 'lucide-react-native';
import type { ReservationHistoryItem } from '../../services/reservationService';

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100',
  CANCELLED: 'bg-red-100',
  ACTIVE: 'bg-blue-100',
};

const STATUS_TEXT: Record<string, string> = {
  COMPLETED: 'text-green-700',
  CANCELLED: 'text-red-600',
  ACTIVE: 'text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  ACTIVE: 'Activo',
};

interface ReservationHistoryCardProps {
  item: ReservationHistoryItem;
}

export function ReservationHistoryCard({ item }: ReservationHistoryCardProps) {
  const statusStyle = STATUS_STYLES[item.status] ?? 'bg-gray-100';
  const statusText = STATUS_TEXT[item.status] ?? 'text-gray-600';
  const statusLabel = STATUS_LABELS[item.status] ?? item.status;

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <Text className="font-semibold text-navy-900 text-sm flex-1">{item.routeName}</Text>
        <View className={`px-2.5 py-0.5 rounded-full ${statusStyle}`}>
          <Text className={`text-xs font-medium ${statusText}`}>{statusLabel}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1.5 mb-3">
        <MapPin size={11} color="#6b7280" />
        <Text className="text-xs text-gray-500">{item.destination}</Text>
      </View>

      <View className="flex-row items-center gap-4 flex-wrap">
        <View className="flex-row items-center gap-1">
          <Clock size={11} color="#6b7280" />
          <Text className="text-xs text-gray-500">{item.date} · {item.time}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Hash size={11} color="#6b7280" />
          <Text className="text-xs text-gray-500">Asiento {item.seat}</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <User size={11} color="#6b7280" />
          <Text className="text-xs text-gray-500">{item.driver}</Text>
        </View>
      </View>
    </View>
  );
}
