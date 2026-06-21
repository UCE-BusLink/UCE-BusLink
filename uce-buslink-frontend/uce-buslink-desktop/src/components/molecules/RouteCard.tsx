import { Bus, Clock } from 'lucide-react';
import { Button } from '../atoms/Button';
import type { ApiRoute } from '../../types';

interface RouteCardProps {
  route: ApiRoute;
  onSelect: () => void;
}

export function RouteCard({ route, onSelect }: RouteCardProps) {
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
