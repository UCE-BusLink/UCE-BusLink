import type { ReactNode } from 'react';

interface MetaCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function MetaCard({ icon, label, value }: MetaCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-base font-bold text-navy-900">{value}</p>
      </div>
    </div>
  );
}
