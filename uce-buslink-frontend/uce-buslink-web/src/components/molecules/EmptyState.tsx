import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  iconBg?: string;
}

export function EmptyState({ icon, title, description, iconBg = 'bg-gray-100' }: EmptyStateProps) {
  return (
    <div className="text-center py-24">
      <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400">{description}</p>}
    </div>
  );
}
