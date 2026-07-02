import { ChevronLeft, Star, Map as MapIcon } from 'lucide-react';

interface RouteDetailHeaderProps {
  backLabel: string;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewMap: () => void;
}

export function RouteDetailHeader({
  backLabel,
  onBack,
  isFavorite,
  onToggleFavorite,
  onViewMap,
}: RouteDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors"
      >
        <ChevronLeft size={16} />
        {backLabel}
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFavorite}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors border ${
            isFavorite
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Star size={16} className={isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
          {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
        </button>
        <button
          onClick={onViewMap}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
        >
          <MapIcon size={16} />
          Ver en mapa
        </button>
      </div>
    </div>
  );
}
