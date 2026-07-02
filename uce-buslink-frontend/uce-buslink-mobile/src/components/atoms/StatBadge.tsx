import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

interface StatBadgeProps {
  icon: ReactNode;
  value: number;
  label: string;
  tone: 'green' | 'amber';
}

const TONE_STYLES: Record<'green' | 'amber', string> = {
  green: 'bg-green-50',
  amber: 'bg-amber-50',
};

const TONE_TEXT: Record<'green' | 'amber', string> = {
  green: 'text-green-600',
  amber: 'text-amber-600',
};

export function StatBadge({ icon, value, label, tone }: StatBadgeProps) {
  return (
    <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg ${TONE_STYLES[tone]}`}>
      {icon}
      <Text className={`text-xs font-semibold ${TONE_TEXT[tone]}`}>
        {value} <Text className="font-normal opacity-80">{label}</Text>
      </Text>
    </View>
  );
}
