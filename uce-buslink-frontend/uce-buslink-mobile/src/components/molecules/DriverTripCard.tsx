import { View, Text, Pressable } from 'react-native';
import { Clock, Armchair, ChevronRight } from 'lucide-react-native';
import type { DriverTripView } from '../../types';

const STATE_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100',
  ONGOING: 'bg-amber-100',
  COMPLETED: 'bg-green-100',
  CANCELLED: 'bg-red-100',
};

const STATE_TEXT: Record<string, string> = {
  SCHEDULED: 'text-blue-700',
  ONGOING: 'text-amber-700',
  COMPLETED: 'text-green-700',
  CANCELLED: 'text-red-600',
};

const STATE_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  ONGOING: 'En curso',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

interface DriverTripCardProps {
  trip: DriverTripView;
  onClick: () => void;
}

export function DriverTripCard({ trip, onClick }: DriverTripCardProps) {
  const stateStyle = STATE_STYLES[trip.state] ?? 'bg-gray-100';
  const stateText = STATE_TEXT[trip.state] ?? 'text-gray-600';
  const stateLabel = STATE_LABELS[trip.state] ?? trip.state;
  const date = new Date(trip.departureTime);
  const time = date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
  const day = date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });

  return (
    <Pressable
      onPress={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-3 flex-row items-center gap-4 active:border-navy-900/30"
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="font-semibold text-navy-900 text-sm flex-1" numberOfLines={1}>{trip.routeName}</Text>
          <View className={`px-2.5 py-0.5 rounded-full ${stateStyle}`}>
            <Text className={`text-xs font-medium ${stateText}`}>{stateLabel}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Clock size={12} color="#6b7280" />
            <Text className="text-xs text-gray-500">{day} · {time}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Armchair size={12} color="#6b7280" />
            <Text className="text-xs text-gray-500">{trip.availableSeats} libres</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={18} color="#d1d5db" />
    </Pressable>
  );
}
