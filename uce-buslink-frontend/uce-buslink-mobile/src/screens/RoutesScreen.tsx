import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, SlidersHorizontal, AlertCircle } from 'lucide-react-native';
import { useRoutes } from '../hooks/useRoutes';
import { useDebounce } from '../hooks/useDebounce';
import { RouteCardSkeleton } from '../components/atoms';
import { RouteCard, RoutesToolbar, EmptyState } from '../components/molecules';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';

export function RoutesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { routes, loading, error, refetch } = useRoutes();

  const query = debouncedQuery.trim().toLowerCase();
  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(query) ||
    (route.description?.toLowerCase().includes(query) ?? false)
  );

  return (
    <ScreenContainer>
      <View className="mb-7">
        <Text className="text-2xl font-bold text-navy-900">Rutas disponibles</Text>
        <Text className="text-gray-500 text-sm mt-1 mb-4">
          Consulta los trayectos nocturnos y asegura tu lugar.
        </Text>
        <RoutesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefetch={refetch}
          loading={loading}
        />
      </View>

      {loading && (
        <View className="gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </View>
      )}

      {!loading && error && (
        <EmptyState
          icon={<AlertCircle size={28} color="#f87171" />}
          iconBg="bg-red-50"
          title="No se pudieron cargar las rutas"
          description={error}
        />
      )}

      {!loading && !error && routes.length === 0 && (
        <EmptyState
          icon={<SlidersHorizontal size={28} color="#9ca3af" />}
          title="No hay rutas disponibles"
          description="Por el momento no existen rutas activas. Intenta mas tarde."
        />
      )}

      {!loading && !error && routes.length > 0 && filteredRoutes.length === 0 && (
        <View className="items-center py-20">
          <Search size={40} color="#d1d5db" />
          <Text className="text-sm font-medium text-gray-500 mb-1 mt-3">Sin resultados</Text>
          <Text className="text-sm text-gray-400">No se encontraron rutas para "{debouncedQuery}"</Text>
        </View>
      )}

      {!loading && !error && filteredRoutes.length > 0 && (
        <View className="gap-5">
          {filteredRoutes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              variant="full"
              onSelect={() => navigation.navigate('RouteDetail', { routeId: route.id })}
            />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}
