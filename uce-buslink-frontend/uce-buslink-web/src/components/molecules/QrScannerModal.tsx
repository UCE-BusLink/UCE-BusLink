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

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = async () => {
    try {
      // 1. "Kill switch" de hardware: Apagamos el flujo de video directamente
      const videoElement = document.querySelector("#qr-reader-container video") as HTMLVideoElement | null;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      // 2. Apagado formal de la librería
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
    await stopScanner(); // Esperamos a que la cámara se apague por completo
    onClose();           // Luego desmontamos el modal
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
          fps: 15, // 15 fps es ideal para evitar sobrecalentamiento sin perder fluidez
          // ELIMINADO: qrbox. Esto obliga a la librería a no inyectar su propio diseño,
          // permitiendo que nuestro HUD de Tailwind funcione sin distorsionar el video.
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
          // Callback silencioso por rendimiento
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

  return (
    <>
      {/* CSS Inyectado para forzar al video de html5-qrcode a comportarse correctamente */}
      <style>{`
        #qr-reader-container video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0.75rem !important;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all">

          {/* Cabecera */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              {title}
            </h2>
            <button
              onClick={handleSafeClose} // <-- CAMBIAR AQUÍ
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cuerpo del Modal */}
          <div className="p-6 flex flex-col items-center justify-center min-h-[380px]">

            {/* Zona de Escaneo Activo */}
            {scanState === "scanning" && !permissionError && (
              <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden shadow-inner group">

                {/* Contenedor nativo de la cámara de html5-qrcode */}
                <div id="qr-reader-container" className="w-full h-full" />

                {/* Capa de diseño encima de la cámara (HUD) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20">

                  {/* Cuadro guía de enfoque */}
                  <div className="relative w-3/5 aspect-square max-w-[240px]">
                    {/* Esquinas iluminadas */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                    {/* Animación del Láser */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_ease-in-out_infinite]" />
                  </div>
                </div>

                {/* Etiqueta flotante */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <span className="bg-slate-900/80 backdrop-blur-md text-[12px] font-medium text-slate-200 px-4 py-1.5 rounded-full tracking-wider uppercase shadow-lg border border-white/10">
                    Alinee el código QR
                  </span>
                </div>
              </div>
            )}

            {/* Estado de Error de Permisos */}
            {permissionError && (
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 mx-auto bg-red-50 dark:bg-red-950/30 flex items-center justify-center rounded-2xl text-red-500 mb-4 border border-red-100 dark:border-red-900/50">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Error de Cámara</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {isSecureContextState
                    ? "No pudimos acceder a la cámara. Por favor, concede los permisos en tu navegador."
                    : "Por políticas de seguridad, este escáner requiere HTTPS."}
                </p>
                <button
                  onClick={handleRetry}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm rounded-xl shadow-md transition-all active:scale-95"
                >
                  <RefreshCw size={16} />
                  Reintentar
                </button>
              </div>
            )}

            {/* Estado: Éxito */}
            {scanState === "success" && (
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 mx-auto bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center rounded-2xl text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-900/50">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">¡Escaneo Exitoso!</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">{message}</p>
                <button
                  onClick={handleRetry}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-md transition-all active:scale-95"
                >
                  Escanear Siguiente
                </button>
              </div>
            )}

            {/* Estado: Error */}
            {scanState === "error" && (
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 mx-auto bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center rounded-2xl text-amber-500 mb-4 border border-amber-100 dark:border-amber-900/50">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Lectura Errónea</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
                <button
                  onClick={handleRetry}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-sm rounded-xl shadow-md transition-all active:scale-95"
                >
                  <RefreshCw size={16} />
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