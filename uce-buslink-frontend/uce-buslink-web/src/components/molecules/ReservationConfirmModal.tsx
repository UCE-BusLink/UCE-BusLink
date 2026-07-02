import { CheckCircle } from 'lucide-react';
import { QrCodeDisplay } from '../atoms';
import type { ApiReservation } from '../../types';

interface ReservationConfirmModalProps {
  reservation: ApiReservation;
  seatNumber: number;
  onClose: () => void;
}

export function ReservationConfirmModal({
  reservation,
  seatNumber,
  onClose,
}: ReservationConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5">
        <div className="text-green-500">
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-navy-900">Booking Confirmed!</h2>
          <p className="text-sm text-gray-500 mt-1">Seat {seatNumber}</p>
        </div>

        <QrCodeDisplay value={reservation.id} />

        <p className="text-xs text-gray-400 text-center">
          Show this code to the driver when boarding
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
