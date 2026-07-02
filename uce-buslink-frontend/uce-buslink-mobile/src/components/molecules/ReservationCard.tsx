import { View, Text } from 'react-native';
import { Bus, Calendar, Clock } from 'lucide-react-native';
import { Button } from '../atoms/Button';
import type { NextReservationData } from '../../hooks/useNextReservation';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface ReservationCardProps {
  data: NextReservationData | null;
  loading?: boolean;
  onNavigateToRoutes: () => void;
}

export function ReservationCard({ data, loading, onNavigateToRoutes }: ReservationCardProps) {
  if (loading) {
    return (
      <View className="gap-3 py-4">
        <View className="h-4 bg-gray-100 rounded w-1/3" />
        <View className="h-10 bg-gray-100 rounded w-1/2" />
        <View className="h-3 bg-gray-100 rounded w-2/3" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="items-center justify-center py-6">
        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
          <Bus size={20} color="#9ca3af" />
        </View>
        <Text className="text-sm font-semibold text-gray-500">Sin reservas activas</Text>
        <Text className="text-xs text-gray-400 mt-1">Reserva un lugar en la sección de Rutas</Text>
        <Button size="sm" onPress={onNavigateToRoutes} className="mt-4">Ver rutas</Button>
      </View>
    );
  }

  const { trip, route } = data;

  return (
    <View>
      <View className="flex-row items-center gap-2 mb-3">
        <View className="w-7 h-7 bg-amber-100 rounded-lg items-center justify-center">
          <Bus size={14} color="#d97706" />
        </View>
        <Text className="font-semibold text-navy-900">{route.name}</Text>
      </View>

      <Text className="text-5xl font-bold text-navy-900">{formatTime(trip.departureTime)}</Text>

      <View className="flex-row items-center gap-4 mt-3">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={14} color="#6b7280" />
          <Text className="text-sm text-gray-500 capitalize">{formatDate(trip.departureTime)}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color="#6b7280" />
          <Text className="text-sm text-gray-500">{trip.availableSeats} cupos restantes</Text>
        </View>
      </View>
    </View>
  );
}
