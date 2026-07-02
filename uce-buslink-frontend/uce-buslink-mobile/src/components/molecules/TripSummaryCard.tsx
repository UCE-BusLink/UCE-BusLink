import { View, Text } from 'react-native';
import { Bus, Clock, Flag, Armchair } from 'lucide-react-native';
import type { DriverTripDetailView } from '../../types';

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

interface TripSummaryCardProps {
  trip: DriverTripDetailView;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long' });
}

function Cell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-1 items-center gap-1 bg-gray-50 rounded-xl py-3">
      {icon}
      <Text className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</Text>
      <Text className="text-sm font-semibold text-navy-900">{value}</Text>
    </View>
  );
}

export function TripSummaryCard({ trip }: TripSummaryCardProps) {
  const stateStyle = STATE_STYLES[trip.state] ?? 'bg-gray-100';
  const stateText = STATE_TEXT[trip.state] ?? 'text-gray-600';
  const stateLabel = STATE_LABELS[trip.state] ?? trip.state;

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-10 h-10 bg-navy-50 rounded-xl items-center justify-center">
            <Bus size={18} color="#1a3a5c" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-navy-900">{trip.routeName}</Text>
            <Text className="text-xs text-gray-500 capitalize">{formatDate(trip.departureTime)}</Text>
          </View>
        </View>
        <View className={`px-2.5 py-1 rounded-full ${stateStyle}`}>
          <Text className={`text-xs font-medium ${stateText}`}>{stateLabel}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Cell icon={<Clock size={15} color="#1a3a5c" />} label="Salida" value={formatTime(trip.departureTime)} />
        <Cell icon={<Flag size={15} color="#1a3a5c" />} label="Llegada" value={formatTime(trip.estimatedArrivalTime)} />
        <Cell icon={<Armchair size={15} color="#1a3a5c" />} label="Libres" value={`${trip.availableSeats}`} />
      </View>
    </View>
  );
}
