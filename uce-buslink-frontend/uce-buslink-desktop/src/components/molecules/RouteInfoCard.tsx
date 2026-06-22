import { Bus, Clock } from 'lucide-react';

interface RouteInfoCardProps {
  name: string;
  isActive: boolean;
  estimatedDurationMinutes: number | null;
  description: string | null | undefined;
  stopsCount: number;
  departuresCount: number;
}

export function RouteInfoCard({
  name,
  isActive,
  estimatedDurationMinutes,
  description,
  stopsCount,
  departuresCount,
}: RouteInfoCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
      <div className="bg-navy-900 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-white">{name}</h3>
          <span className="text-xs bg-white/10 text-white/70 px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 flex items-center gap-1">
            <Bus size={11} />
            {isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
        {estimatedDurationMinutes !== null && (
          <p className="text-white/50 text-xs flex items-center gap-1">
            <Clock size={11} />
            {estimatedDurationMinutes} min aprox.
          </p>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Descripción</p>
        <p className="text-sm text-gray-600 leading-relaxed mb-5">
          {description ?? 'Esta ruta no tiene una descripción registrada.'}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400">Paradas</span>
          <span className="text-sm font-semibold text-navy-900">{stopsCount}</span>
        </div>
        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-gray-400">Salidas diarias</span>
          <span className="text-sm font-semibold text-navy-900">{departuresCount}</span>
        </div>
      </div>
    </div>
  );
}
