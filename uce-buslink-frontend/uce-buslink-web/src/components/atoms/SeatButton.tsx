import type { Seat, SeatStatus } from '../../types';

const SEAT_STYLES: Record<SeatStatus, string> = {
  available: 'bg-green-400 hover:bg-green-500 text-white cursor-pointer',
  occupied: 'bg-red-400 text-white cursor-not-allowed',
  selected: 'bg-navy-900 text-white cursor-pointer ring-2 ring-navy-700 ring-offset-1',
};

interface SeatButtonProps {
  seat: Seat;
  onSelect: () => void;
}

export function SeatButton({ seat, onSelect }: SeatButtonProps) {
  return (
    <button
      onClick={seat.status !== 'occupied' ? onSelect : undefined}
      disabled={seat.status === 'occupied'}
      className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${SEAT_STYLES[seat.status]}`}
    >
      {seat.number}
    </button>
  );
}
