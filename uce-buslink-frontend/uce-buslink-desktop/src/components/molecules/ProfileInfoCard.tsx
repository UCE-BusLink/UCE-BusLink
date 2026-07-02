import type { ReactNode } from 'react';
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-2">{title}</h3>
      {rows.map((row, i) => (
        <InfoRow key={i} icon={row.icon} label={row.label} value={row.value} />
      ))}
    </div>
  );
}
