import { ActivityIndicator, View } from 'react-native';

export function Spinner() {
  return <ActivityIndicator size="small" color="#0a1628" />;
}

export function RouteCardSkeleton() {
  return (
    <View className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <View className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
      <View className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
      <View className="h-8 bg-gray-100 rounded-lg w-full" />
    </View>
  );
}
