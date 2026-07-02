import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface ProfileStatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  accent: string;
}

export function ProfileStatCard({ icon, value, label, accent }: ProfileStatCardProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1">
      <View className={`w-11 h-11 rounded-xl items-center justify-center mb-4 ${accent}`}>
        {icon}
      </View>
      <Text className="text-2xl font-bold text-navy-900">{value}</Text>
      <Text className="text-sm text-gray-500 mt-0.5">{label}</Text>
    </View>
  );
}
