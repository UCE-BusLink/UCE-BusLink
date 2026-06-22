import { Bus, Clock } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { ApiRoute } from '../../types';

interface RouteCardProps {
  route: ApiRoute;
  onSelect: () => void;
  variant?: 'compact' | 'full';
}

export function RouteCard({ route, onSelect, variant = 'compact' }: RouteCardProps) {
  if (variant === 'full') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-navy-900 leading-tight pr-2">{route.name}</h3>
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bus size={16} className="text-gray-600" />
          </div>
        </div>
        {route.description && (
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{route.description}</p>
        )}
        {route.estimatedDurationMinutes !== null && (
          <div className="flex items-center gap-1.5 mb-5">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500">{route.estimatedDurationMinutes} min aprox.</span>
          </div>
        )}
        <Button onClick={onSelect} className="w-full rounded-xl mt-auto">
          Ver viajes
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 bg-amber-100 rounded-md flex items-center justify-center flex-shrink-0">
          <Bus size={12} className="text-amber-600" />
        </div>
        <span className="text-sm font-semibold text-navy-900 truncate">{route.name}</span>
      </div>
      {route.estimatedDurationMinutes !== null && (
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <Clock size={11} />
          {route.estimatedDurationMinutes} min aprox.
        </p>
      )}
      <Button size="sm" onClick={onSelect} className="w-full py-2">
        Ver viajes
      </Button>
    </div>
  );
}
