import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface MetaCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function MetaCard({ icon, label, value }: MetaCardProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-row items-center gap-3">
      <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text className="text-base font-bold text-navy-900">{value}</Text>
      </View>
    </View>
  );
}
