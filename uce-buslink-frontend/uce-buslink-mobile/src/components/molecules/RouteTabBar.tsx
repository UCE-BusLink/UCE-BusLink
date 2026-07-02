import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Route as RouteIcon } from 'lucide-react-native';
import type { ApiRoute } from '../../types';

interface RouteTabBarProps {
  routes: ApiRoute[];
  selectedId: string;
  loading: boolean;
  onSelect: (id: string) => void;
}

export function RouteTabBar({ routes, selectedId, loading, onSelect }: RouteTabBarProps) {
  if (loading) {
    return (
      <View className="flex-row items-center gap-2">
        <ActivityIndicator size="small" color="#9ca3af" />
        <Text className="text-sm text-gray-400">Cargando rutas...</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-2 flex-wrap">
      {routes.map((route) => {
        const active = selectedId === route.id;
        return (
          <Pressable
            key={route.id}
            onPress={() => onSelect(route.id)}
            className={`flex-row items-center gap-2 px-4 py-2.5 rounded-xl ${
              active ? 'bg-navy-900' : 'bg-white border border-gray-200'
            }`}
          >
            <RouteIcon size={15} color={active ? '#ffffff' : '#4b5563'} />
            <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600'}`}>
              {route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
