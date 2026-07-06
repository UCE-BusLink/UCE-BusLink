import type { ReactNode } from 'react';

interface StatBadgeProps {
  icon: ReactNode;
  value: number;
  label: string;
  tone: 'green' | 'amber';
}

const TONE_STYLES: Record<'green' | 'amber', string> = {
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
};

export function StatBadge({ icon, value, label, tone }: StatBadgeProps) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${TONE_STYLES[tone]}`}>
      {icon}
      <span className="text-xs font-semibold">
        {value} <span className="font-normal opacity-80">{label}</span>
      </span>
    </div>
  );
}
