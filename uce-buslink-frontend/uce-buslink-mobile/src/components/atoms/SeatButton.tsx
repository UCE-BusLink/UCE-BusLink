import { Pressable, Text } from 'react-native';
import type { Seat, SeatStatus } from '../../types';

const SEAT_STYLES: Record<SeatStatus, string> = {
  available: 'bg-green-400',
  occupied: 'bg-red-400',
  selected: 'bg-navy-900 border-2 border-navy-700',
};

interface SeatButtonProps {
  seat: Seat;
  onSelect: () => void;
}

export function SeatButton({ seat, onSelect }: SeatButtonProps) {
  return (
    <Pressable
      onPress={seat.status !== 'occupied' ? onSelect : undefined}
      disabled={seat.status === 'occupied'}
      className={`w-10 h-10 rounded-lg items-center justify-center ${SEAT_STYLES[seat.status]}`}
    >
      <Text className="text-xs font-bold text-white">{seat.number}</Text>
    </Pressable>
  );
}
