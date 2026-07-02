import { View, Text } from 'react-native';

interface LegendItemProps {
  color: string;
  label: string;
}

export function LegendItem({ color, label }: LegendItemProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className={`w-3 h-3 rounded-full ${color}`} />
      <Text className="text-xs text-gray-500">{label}</Text>
    </View>
  );
}
