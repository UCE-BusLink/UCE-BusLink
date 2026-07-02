import { View, Text, Pressable, Modal } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
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
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="bg-white rounded-2xl p-8 max-w-sm w-full items-center gap-5">
          <CheckCircle size={48} strokeWidth={1.5} color="#22c55e" />

          <View className="items-center">
            <Text className="text-xl font-bold text-navy-900">Booking Confirmed!</Text>
            <Text className="text-sm text-gray-500 mt-1">Seat {seatNumber}</Text>
          </View>

          <QrCodeDisplay value={reservation.id} />

          <Text className="text-xs text-gray-400 text-center">
            Show this code to the driver when boarding
          </Text>

          <Pressable
            onPress={onClose}
            className="w-full py-3 rounded-xl bg-amber-500 items-center active:bg-amber-600"
          >
            <Text className="text-sm font-semibold text-white">Go to dashboard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
