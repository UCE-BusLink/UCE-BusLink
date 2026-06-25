import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

type ScanState = 'scanning' | 'success' | 'error';

interface QrScannerModalProps {
  onScan: (reservationId: string) => Promise<void>;
  onClose: () => void;
}

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const [state, setState] = useState<ScanState>('scanning');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        scanner.clear().catch(() => {});
        try {
          await onScanRef.current(decodedText);
          setState('success');
          setMessage('Pasajero marcado como abordado.');
        } catch {
          setState('error');
          setMessage('QR inválido o reserva no encontrada.');
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [attempt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy-900 text-sm">Escanear QR</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {state === 'scanning' && (
            <div id="qr-reader-container" className="w-full" />
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle size={40} className="text-green-500" />
              <p className="text-sm text-gray-600 text-center">{message}</p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl"
              >
                Listo
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center py-6 gap-3">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm text-gray-600 text-center">{message}</p>
              <button
                onClick={() => { setState('scanning'); setAttempt((a) => a + 1); }}
                className="mt-2 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
