import type { ReactNode } from 'react';

interface ProfileStatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  accent: string;
}

export function ProfileStatCard({ icon, value, label, accent }: ProfileStatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
