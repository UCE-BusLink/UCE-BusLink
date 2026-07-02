import { View, Text } from 'react-native';
import { Navigation, Flag, MapPin } from 'lucide-react-native';
import type { RouteStopDetail, StopType } from '../../types';

const STOP_DOT: Record<StopType, string> = {
  origin: 'bg-green-500',
  stop: 'bg-navy-700',
  destination: 'bg-amber-500',
};

function StopDotIcon({ type }: { type: StopType }) {
  if (type === 'origin') return <Navigation size={13} color="#ffffff" />;
  if (type === 'destination') return <Flag size={13} color="#ffffff" />;
  return <MapPin size={11} color="#ffffff" />;
}

interface StopRowProps {
  stop: RouteStopDetail;
  isLast: boolean;
}

export function StopRow({ stop, isLast }: StopRowProps) {
  const label =
    stop.type === 'origin' ? 'Origen' :
    stop.type === 'destination' ? 'Destino' : 'Parada';

  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View className={`w-7 h-7 rounded-full items-center justify-center ${STOP_DOT[stop.type]}`}>
          <StopDotIcon type={stop.type} />
        </View>
        {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
      </View>
      <View className={isLast ? '' : 'pb-6'}>
        <Text className="text-xs text-gray-400">{stop.order}. {label}</Text>
        <Text className="text-sm font-semibold text-navy-900">{stop.name}</Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <MapPin size={11} color="#9ca3af" />
          <Text className="text-xs text-gray-400">{stop.lat.toFixed(5)}, {stop.lng.toFixed(5)}</Text>
        </View>
      </View>
    </View>
  );
}
