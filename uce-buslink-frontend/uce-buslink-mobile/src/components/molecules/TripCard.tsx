import { View, Text, Pressable } from 'react-native';
import { Clock, MapPin, User as UserIcon, Armchair, Users } from 'lucide-react-native';
import { StatBadge } from '../atoms';
import type { Trip, Route } from '../../types';

interface TripCardProps {
  trip: Trip;
  route: Route;
  onSelect: () => void;
}

export function TripCard({ trip, route, onSelect }: TripCardProps) {
  const hasSpace = trip.availableSeats + trip.standingSpots > 0;

  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-navy-900">{route.name}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MapPin size={13} color="#9ca3af" />
            <Text className="text-sm text-gray-500">{route.destination}</Text>
          </View>
        </View>
        <View className="items-end">
          <View className="flex-row items-center gap-1.5">
            <Clock size={15} color="#f59e0b" />
            <Text className="text-navy-900 font-bold">{trip.time}</Text>
          </View>
          <Text className="text-xs text-gray-400 mt-1">hrs</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-4">
        <UserIcon size={14} color="#9ca3af" />
        <Text className="text-sm text-gray-500">{trip.driver}</Text>
      </View>

      <View className="flex-row items-center gap-2 mb-5 flex-wrap">
        <StatBadge icon={<Armchair size={13} color="#16a34a" />} value={trip.availableSeats} label="asientos" tone="green" />
        <StatBadge icon={<Users size={13} color="#d97706" />} value={trip.standingSpots} label="de pie" tone="amber" />
      </View>

      <Pressable
        onPress={hasSpace ? onSelect : undefined}
        disabled={!hasSpace}
        className={`w-full py-3 rounded-xl items-center ${hasSpace ? 'bg-navy-900 active:bg-navy-800' : 'bg-gray-100'}`}
      >
        <Text className={`text-sm font-semibold ${hasSpace ? 'text-white' : 'text-gray-400'}`}>
          {hasSpace ? 'Seleccionar lugar' : 'Sin cupos'}
        </Text>
      </Pressable>
    </View>
  );
}
