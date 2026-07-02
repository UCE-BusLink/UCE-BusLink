import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  iconBg?: string;
}

export function EmptyState({ icon, title, description, iconBg = 'bg-gray-100' }: EmptyStateProps) {
  return (
    <View className="items-center py-24">
      <View className={`w-16 h-16 ${iconBg} rounded-full items-center justify-center mb-4`}>
        {icon}
      </View>
      <Text className="font-semibold text-gray-700 mb-1 text-center">{title}</Text>
      {description ? <Text className="text-sm text-gray-400 text-center">{description}</Text> : null}
    </View>
  );
}
