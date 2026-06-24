import { Clock } from 'lucide-react';

interface DepartureTimesListProps {
  times: string[];
}

export function DepartureTimesList({ times }: DepartureTimesListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-navy-900 mb-4">Próximas salidas</h2>
      {times.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {times.map((time) => (
            <span
              key={time}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2 text-sm font-semibold text-navy-900"
            >
              <Clock size={14} className="text-amber-500" />
              {time}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No hay salidas programadas para esta fecha.</p>
      )}
    </div>
  );
}
