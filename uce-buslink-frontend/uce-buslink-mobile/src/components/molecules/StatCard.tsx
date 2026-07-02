import { View, Text } from 'react-native';

interface StatCardProps {
  label: string;
  value: string | null;
  valueClassName?: string;
}

export function StatCard({ label, value, valueClassName = 'text-navy-900' }: StatCardProps) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className={`text-sm font-bold ${valueClassName}`}>{value ?? '--'}</Text>
    </View>
  );
}
