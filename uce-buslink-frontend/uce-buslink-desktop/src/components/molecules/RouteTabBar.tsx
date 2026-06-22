import { Route as RouteIcon, Loader2 } from 'lucide-react';
import type { ApiRoute } from '../../types';

interface RouteTabBarProps {
  routes: ApiRoute[];
  selectedId: string;
  loading: boolean;
  onSelect: (id: string) => void;
}

export function RouteTabBar({ routes, selectedId, loading, onSelect }: RouteTabBarProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 size={15} className="animate-spin" />
        Cargando rutas...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {routes.map((route) => (
        <button
          key={route.id}
          onClick={() => onSelect(route.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            selectedId === route.id
              ? 'bg-navy-900 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <RouteIcon size={15} />
          {route.name}
        </button>
      ))}
    </div>
  );
}
