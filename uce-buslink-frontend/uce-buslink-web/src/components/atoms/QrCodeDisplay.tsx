import QRCode from 'react-qr-code';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
}

export function QrCodeDisplay({ value, size = 180 }: QrCodeDisplayProps) {
  return (
    <div className="bg-white p-3 rounded-xl inline-block">
      <QRCode value={value} size={size} />
    </div>
  );
}
