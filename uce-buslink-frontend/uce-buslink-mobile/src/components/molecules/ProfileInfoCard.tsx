import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { InfoRow } from '../atoms';

interface ProfileInfoRow {
  icon: ReactNode;
  label: string;
  value: string;
}

interface ProfileInfoCardProps {
  title: string;
  rows: ProfileInfoRow[];
}

export function ProfileInfoCard({ title, rows }: ProfileInfoCardProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <Text className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-2">{title}</Text>
      {rows.map((row, i) => (
        <InfoRow key={i} icon={row.icon} label={row.label} value={row.value} />
      ))}
    </View>
  );
}
