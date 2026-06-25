import { useState } from 'react';
import { User, Hash } from 'lucide-react';
import type { DriverPassenger } from '../../types';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-blue-100 text-blue-700',
  BOARDED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  BOARDED: 'Abordó',
  CANCELLED: 'Cancelado',
};

interface PassengerRowProps {
  passenger: DriverPassenger;
  onCancel: () => void;
  cancelling?: boolean;
}

export function PassengerRow({ passenger, onCancel, cancelling }: PassengerRowProps) {
  const [confirming, setConfirming] = useState(false);
  const statusStyle = STATUS_STYLES[passenger.status] ?? 'bg-gray-100 text-gray-600';
  const statusLabel = STATUS_LABELS[passenger.status] ?? passenger.status;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-navy-900/10 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-navy-900" />
        </div>
        <div>
          <p className="text-sm font-medium text-navy-900">{passenger.studentName}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Hash size={10} />
            Asiento {passenger.seat}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle}`}>
          {statusLabel}
        </span>

        {passenger.status !== 'CANCELLED' && (
          confirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirming(false)}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                No
              </button>
              <button
                onClick={() => { setConfirming(false); onCancel(); }}
                disabled={cancelling}
                className="text-xs font-semibold bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling ? '...' : 'Sí'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="text-xs text-red-400 hover:text-red-500 font-medium"
            >
              Cancelar
            </button>
          )
        )}
      </div>
    </div>
  );
}
