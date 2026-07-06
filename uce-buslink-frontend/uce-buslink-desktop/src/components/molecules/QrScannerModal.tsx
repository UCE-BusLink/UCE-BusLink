import { useEffect, useRef, useState } from "react";
import { X, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

type ScanState = "scanning" | "success" | "error";

interface QrScannerModalProps {
  onScan: (reservationId: string) => Promise<void>;
  onClose: () => void;
  title?: string;
  successMessage?: string;
}

export function QrScannerModal({
  onScan,
  onClose,
  title = "Escanear Código QR",
  successMessage = "Pasajero marcado como abordado.",
}: QrScannerModalProps) {
  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [message, setMessage] = useState("");
  const [permissionError, setPermissionError] = useState(false);
  const [isSecureContextState, setIsSecureContextState] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    startScanner();
    return () => {
      // Don't await in cleanup, just fire and forget
      stopScanner().catch(console.error);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = async () => {
    try {
      const videoElement = document.querySelector("#qr-reader-container video") as HTMLVideoElement | null;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (e) {
      console.error("Error cerrando scanner:", e);
    }
  };

  const handleSafeClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    await stopScanner();
    onClose();
  };

  const startScanner = async () => {
    handledRef.current = false;
    setPermissionError(false);
    setScanState("scanning");

    try {
      const container = document.getElementById("qr-reader-container");
      if (container) container.innerHTML = "";

      if (!window.isSecureContext) {
        setPermissionError(true);
        setIsSecureContextState(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        throw new Error("No se encontraron cámaras disponibles.");
      }

      const scanner = new Html5Qrcode("qr-reader-container");
      scannerRef.current = scanner;

      let selectedCamera = cameras[0];
      const keywords = ["back", "rear", "trasera", "environment"];
      const backCamera = cameras.find((camera) =>
        keywords.some((k) => camera.label.toLowerCase().includes(k))
      );

      if (backCamera) {
        selectedCamera = backCamera;
      }

      await scanner.start(
        selectedCamera.id,
        {
          fps: 15,
        },
        async (decodedText) => {
          if (handledRef.current) return;
          handledRef.current = true;

          await stopScanner();

          try {
            await onScan(decodedText);
            setScanState("success");
            setMessage(successMessage);
          } catch (err) {
            console.error(err);
            setScanState("error");
            setMessage("Código QR inválido o no registrado.");
          }
        },
        () => {
        }
      );
    } catch (err: any) {
      console.error("Error al iniciar escáner:", err);
      setPermissionError(true);
    }
  };

  const handleRetry = async () => {
    await stopScanner();
    startScanner();
  };

  if (isClosing) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-navy-900/60 backdrop-blur-md animate-fade-out">
        <div className="flex flex-col items-center justify-center">
          <RefreshCw className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white font-bold tracking-widest uppercase">Cerrando Cámara...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        #qr-reader-container video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 1rem !important;
        }
      `}</style>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-navy-900/60 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden transform transition-all ring-1 ring-black/5">
          
          <div className="flex justify-between items-center px-8 py-6 border-b border-white/40 bg-white/40">
            <h2 className="text-xl font-bold text-navy-900 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" />
              {title}
            </h2>
            <button
              onClick={handleSafeClose}
              className="p-2.5 rounded-2xl text-gray-400 hover:text-navy-900 hover:bg-white shadow-sm transition-all bg-white/50 border border-white/60"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 flex flex-col items-center justify-center min-h-[420px]">
            {scanState === "scanning" && !permissionError && (
              <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-[inset_0_4px_24px_rgba(0,0,0,0.4)] group ring-4 ring-white/50">
                <div id="qr-reader-container" className="w-full h-full" />
                
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/10">
                  <div className="relative w-2/3 aspect-square max-w-[260px]">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl shadow-[0_0_15px_rgba(var(--color-primary),0.5)]" />
                    
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_rgba(var(--color-primary),1)] animate-[scan_2.5s_ease-in-out_infinite]" />
                  </div>
                </div>

                <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-fade-in-up">
                  <span className="bg-black/40 backdrop-blur-md text-xs font-bold text-white px-5 py-2.5 rounded-2xl tracking-widest uppercase shadow-xl border border-white/20">
                    Alinee el código QR
                  </span>
                </div>
              </div>
            )}

            {permissionError && (
              <div className="text-center max-w-sm animate-fade-in">
                <div className="w-20 h-20 mx-auto bg-red-100 flex items-center justify-center rounded-[2rem] text-red-500 mb-6 border-4 border-white shadow-sm">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-navy-900">Error de Cámara</h3>
                <p className="mt-3 text-base text-gray-500 font-medium">
                  {isSecureContextState
                    ? "No pudimos acceder a la cámara. Por favor, concede los permisos necesarios en tu navegador."
                    : "Por políticas de seguridad, el escáner requiere una conexión segura (HTTPS)."}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-8 inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-navy-900 hover:bg-primary text-white font-bold text-base rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  <RefreshCw size={20} />
                  Reintentar Acceso
                </button>
              </div>
            )}

            {scanState === "success" && (
              <div className="text-center max-w-sm animate-fade-in">
                <div className="w-24 h-24 mx-auto bg-emerald-100 flex items-center justify-center rounded-[2.5rem] text-emerald-500 mb-6 border-4 border-white shadow-md">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-black text-navy-900">¡Escaneo Exitoso!</h3>
                <p className="mt-3 text-base text-gray-600 font-medium">{message}</p>
                <button
                  onClick={handleRetry}
                  className="mt-8 w-full px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-[0_8px_20px_rgba(5,150,105,0.3)] transition-all active:scale-95"
                >
                  Escanear Siguiente Pasajero
                </button>
              </div>
            )}

            {scanState === "error" && (
              <div className="text-center max-w-sm animate-fade-in">
                <div className="w-24 h-24 mx-auto bg-amber-100 flex items-center justify-center rounded-[2.5rem] text-amber-500 mb-6 border-4 border-white shadow-md">
                  <AlertCircle size={48} />
                </div>
                <h3 className="text-2xl font-black text-navy-900">Lectura Errónea</h3>
                <p className="mt-3 text-base text-gray-600 font-medium">{message}</p>
                <button
                  onClick={handleRetry}
                  className="mt-8 inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-base rounded-2xl shadow-[0_8px_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
                >
                  <RefreshCw size={20} />
                  Volver a Intentar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}