import { View, Text, TextInput, Pressable } from 'react-native';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react-native';

interface RoutesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefetch: () => void;
  loading: boolean;
}

export function RoutesToolbar({ searchQuery, onSearchChange, onRefetch, loading }: RoutesToolbarProps) {
  return (
    <View className="gap-3">
      <View className="relative justify-center">
        <View className="absolute left-3 z-10">
          <Search size={16} color="#9ca3af" />
        </View>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Buscar ruta..."
          placeholderTextColor="#9ca3af"
          className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-navy-900"
        />
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5">
          <SlidersHorizontal size={16} color="#4b5563" />
          <Text className="text-sm text-gray-600">Filtrar por horario</Text>
        </Pressable>
        <Pressable
          onPress={onRefetch}
          disabled={loading}
          className={`flex-1 flex-row items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 ${loading ? 'opacity-50' : ''}`}
        >
          <RefreshCw size={16} color="#4b5563" />
          <Text className="text-sm text-gray-600">Recargar</Text>
        </Pressable>
      </View>
    </View>
  );
}
