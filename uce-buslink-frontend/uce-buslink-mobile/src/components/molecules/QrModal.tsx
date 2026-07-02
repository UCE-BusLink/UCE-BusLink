import { View, Text, Pressable, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { QrCodeDisplay } from '../atoms';

interface QrModalProps {
  qrCode: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function QrModal({ qrCode, title, subtitle, onClose }: QrModalProps) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable className="bg-white rounded-2xl p-8 items-center gap-5 w-80" onPress={() => {}}>
          <View className="w-full flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-navy-900">{title}</Text>
              {subtitle ? <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text> : null}
            </View>
            <Pressable onPress={onClose}>
              <X size={18} color="#9ca3af" />
            </Pressable>
          </View>

          <QrCodeDisplay value={qrCode} size={200} />

          <Text className="text-xs text-gray-400 text-center">
            Muestra este código al conductor al abordar
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
