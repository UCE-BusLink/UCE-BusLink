import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface RoutesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefetch: () => void;
  loading: boolean;
}

export function RoutesToolbar({ searchQuery, onSearchChange, onRefetch, loading }: RoutesToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar ruta..."
          className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy-800 w-52 transition-colors"
        />
      </div>
      <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        <SlidersHorizontal size={16} />
        Filtrar por horario
      </button>
      <button
        onClick={onRefetch}
        disabled={loading}
        title="Recargar rutas"
        className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        Recargar
      </button>
    </div>
  );
}
