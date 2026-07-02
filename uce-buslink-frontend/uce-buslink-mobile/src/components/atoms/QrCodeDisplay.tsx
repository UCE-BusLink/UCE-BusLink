import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
}

export function QrCodeDisplay({ value, size = 180 }: QrCodeDisplayProps) {
  return (
    <View className="bg-white p-3 rounded-xl self-center">
      <QRCode value={value || ' '} size={size} />
    </View>
  );
}
