import { X } from 'lucide-react';
import { QrCodeDisplay } from '../atoms';

interface QrModalProps {
  qrCode: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export function QrModal({ qrCode, title, subtitle, onClose }: QrModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 flex flex-col items-center gap-5 shadow-2xl w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-navy-900">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <QrCodeDisplay value={qrCode} size={200} />

        <p className="text-xs text-gray-400 text-center">
          Muestra este código al conductor al abordar
        </p>
      </div>
    </div>
  );
}
