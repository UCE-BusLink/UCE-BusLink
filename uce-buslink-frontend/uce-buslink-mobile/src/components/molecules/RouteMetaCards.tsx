import { View } from 'react-native';
import { Clock, MapPin, Bus } from 'lucide-react-native';
import { MetaCard } from '../atoms';
import type { ApiRoute } from '../../types';

interface RouteMetaCardsProps {
  route: ApiRoute | null;
  stopsCount: number;
}

export function RouteMetaCards({ route, stopsCount }: RouteMetaCardsProps) {
  return (
    <View className="flex-row gap-4 mt-4">
      <View className="flex-1">
        <MetaCard
          icon={<Clock size={16} color="#1a3a5c" />}
          label="Duración est."
          value={route?.estimatedDurationMinutes ? `${route.estimatedDurationMinutes} min` : '--'}
        />
      </View>
      <View className="flex-1">
        <MetaCard
          icon={<MapPin size={16} color="#1a3a5c" />}
          label="Paradas"
          value={`${stopsCount}`}
        />
      </View>
      <View className="flex-1">
        <MetaCard
          icon={<Bus size={16} color="#1a3a5c" />}
          label="Estado"
          value={route?.isActive ? 'Activa' : route ? 'Inactiva' : '--'}
        />
      </View>
    </View>
  );
}
