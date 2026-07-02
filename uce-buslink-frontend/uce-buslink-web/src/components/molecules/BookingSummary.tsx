import type { ReactNode } from 'react';
import { Bus, Clock } from 'lucide-react';

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-navy-900">{value}</p>
      </div>
    </div>
  );
}

interface BookingSummaryProps {
  routeName: string;
  tripTime: string;
  selectionLabel: string | null;
  hasSelection: boolean;
  confirming: boolean;
  onConfirm: () => void;
}

export function BookingSummary({
  routeName,
  tripTime,
  selectionLabel,
  hasSelection,
  confirming,
  onConfirm,
}: BookingSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit">
      <h2 className="text-sm font-semibold text-navy-900 mb-5">Resumen de Reserva</h2>

      <div className="space-y-4">
        <SummaryRow icon={<Bus size={14} />} label="Ruta" value={routeName} />
        <SummaryRow icon={<Clock size={14} />} label="Horario" value={`${tripTime} hrs`} />
      </div>

      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Tu selección</p>
        {selectionLabel ? (
          <p className="text-2xl font-bold text-navy-900">{selectionLabel}</p>
        ) : (
          <p className="text-sm text-gray-400">Ninguno seleccionado</p>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={!hasSelection || confirming}
        className={`w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${
          hasSelection && !confirming
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {confirming ? 'Confirmando...' : 'Confirmar reserva →'}
      </button>
    </div>
  );
}
