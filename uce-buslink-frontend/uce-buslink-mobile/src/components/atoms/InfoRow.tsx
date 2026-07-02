import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-100">
      <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text className="text-sm font-semibold text-navy-900" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}
