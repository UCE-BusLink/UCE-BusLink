import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

type ScanState = 'scanning' | 'success' | 'error';

interface QrScannerModalProps {
  onScan: (reservationId: string) => Promise<void>;
  onClose: () => void;
  title?: string;
  successMessage?: string;
}

export function QrScannerModal({
  onScan,
  onClose,
  title = 'Escanear QR',
  successMessage = 'Pasajero marcado como abordado.',
}: QrScannerModalProps) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onScanRef = useRef(onScan);
  const successRef = useRef(successMessage);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    onScanRef.current = onScan;
    successRef.current = successMessage;
  }, [onScan, successMessage]);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader-container');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'user' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          if (handledRef.current) return;
          handledRef.current = true;
          console.log('[QrScanner] decoded:', text);
          try { await scanner.stop(); } catch {}
          try {
            await onScanRef.current(text);
            setScanState('success');
            setMessage(successRef.current);
          } catch {
            setScanState('error');
            setMessage('QR inválido o reserva no encontrada.');
          }
        },
        () => {}
      )
      .catch(() => {});

    return () => {
      try { scanner.stop().catch(() => {}); } catch {}
    };
  }, []);

  const handleRetry = () => {
    handledRef.current = false;
    setScanState('scanning');
    const scanner = new Html5Qrcode('qr-reader-container');
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: 'user' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (text) => {
          if (handledRef.current) return;
          handledRef.current = true;
          console.log('[QrScanner] decoded:', text);
          try { await scanner.stop(); } catch {}
          try {
            await onScanRef.current(text);
            setScanState('success');
            setMessage(successRef.current);
          } catch {
            setScanState('error');
            setMessage('QR inválido o reserva no encontrada.');
          }
        },
        () => {}
      )
      .catch(() => {});
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const current = scannerRef.current;
    if (current) {
      try { await current.stop(); } catch {}
    }

    const divId = 'qr-file-scanner-tmp';
    let div = document.getElementById(divId);
    if (!div) {
      div = document.createElement('div');
      div.id = divId;
      div.style.display = 'none';
      document.body.appendChild(div);
    }

    const fileScanner = new Html5Qrcode(divId);
    try {
      const result = await fileScanner.scanFile(file, false);
      await onScanRef.current(result);
      setScanState('success');
      setMessage(successRef.current);
    } catch {
      setScanState('error');
      setMessage('No se encontró un QR válido en la imagen.');
    } finally {
      try { await fileScanner.clear(); } catch {}
      document.getElementById(divId)?.remove();
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-navy-900 text-sm">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Container always in DOM so scanner keeps its reference */}
          <div
            id="qr-reader-container"
            className={`w-full rounded-xl overflow-hidden ${scanState !== 'scanning' ? 'hidden' : ''}`}
          />

          {scanState === 'scanning' && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-400">o sube una imagen con el código QR</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Upload size={15} />
                {uploading ? 'Procesando...' : 'Subir imagen'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {scanState === 'success' && (
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

          {scanState === 'error' && (
            <div className="flex flex-col items-center py-6 gap-3">
              <AlertCircle size={40} className="text-red-400" />
              <p className="text-sm text-gray-600 text-center">{message}</p>
              <button
                onClick={handleRetry}
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
