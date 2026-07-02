import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react-native';

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
  title = 'Escanear Código QR',
  successMessage = 'Pasajero marcado como abordado.',
}: QrScannerModalProps) {
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [message, setMessage] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  const handleScanned = async ({ data }: { data: string }) => {
    if (handledRef.current) return;
    handledRef.current = true;
    try {
      await onScan(data);
      setScanState('success');
      setMessage(successMessage);
    } catch (err) {
      console.error(err);
      setScanState('error');
      setMessage('Código QR inválido o no registrado.');
    }
  };

  const handleRetry = () => {
    handledRef.current = false;
    setScanState('scanning');
    setMessage('');
  };

  const permissionError = permission != null && !permission.granted;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center p-4 bg-slate-900/80">
        <View className="w-full max-w-md bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-slate-100">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-blue-600" />
              <Text className="text-lg font-semibold text-slate-800">{title}</Text>
            </View>
            <Pressable onPress={onClose} className="p-1.5 rounded-lg">
              <X size={20} color="#94a3b8" />
            </Pressable>
          </View>

          <View className="p-6 items-center justify-center min-h-[380px]">
            {scanState === 'scanning' && !permissionError && (
              <View className="w-full aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden">
                {permission?.granted ? (
                  <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={handledRef.current ? undefined : handleScanned}
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-slate-300 text-sm">Solicitando cámara...</Text>
                  </View>
                )}
                <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                  <View className="w-3/5 aspect-square max-w-[240px] border-2 border-blue-500/70 rounded-lg" />
                </View>
                <View className="absolute bottom-4 left-0 right-0 items-center">
                  <Text className="bg-slate-900/80 text-[12px] font-medium text-slate-200 px-4 py-1.5 rounded-full uppercase">
                    Alinee el código QR
                  </Text>
                </View>
              </View>
            )}

            {permissionError && (
              <View className="items-center max-w-xs">
                <View className="w-16 h-16 bg-red-50 items-center justify-center rounded-2xl mb-4 border border-red-100">
                  <AlertCircle size={32} color="#ef4444" />
                </View>
                <Text className="text-base font-semibold text-slate-800">Error de Cámara</Text>
                <Text className="mt-2 text-sm text-slate-500 text-center">
                  No pudimos acceder a la cámara. Concede los permisos en la configuración del sistema.
                </Text>
                <Pressable
                  onPress={requestPermission}
                  className="mt-6 flex-row items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-xl active:opacity-90"
                >
                  <RefreshCw size={16} color="#ffffff" />
                  <Text className="text-white font-medium text-sm">Reintentar</Text>
                </Pressable>
              </View>
            )}

            {scanState === 'success' && (
              <View className="items-center max-w-xs">
                <View className="w-16 h-16 bg-emerald-50 items-center justify-center rounded-2xl mb-4 border border-emerald-100">
                  <CheckCircle size={32} color="#10b981" />
                </View>
                <Text className="text-base font-semibold text-slate-800">¡Escaneo Exitoso!</Text>
                <Text className="mt-2 text-sm text-slate-600 font-medium text-center">{message}</Text>
                <Pressable
                  onPress={handleRetry}
                  className="mt-6 px-5 py-2.5 bg-emerald-600 rounded-xl active:opacity-90"
                >
                  <Text className="text-white font-medium text-sm">Escanear Siguiente</Text>
                </Pressable>
              </View>
            )}

            {scanState === 'error' && (
              <View className="items-center max-w-xs">
                <View className="w-16 h-16 bg-amber-50 items-center justify-center rounded-2xl mb-4 border border-amber-100">
                  <AlertCircle size={32} color="#f59e0b" />
                </View>
                <Text className="text-base font-semibold text-slate-800">Lectura Errónea</Text>
                <Text className="mt-2 text-sm text-slate-500 text-center">{message}</Text>
                <Pressable
                  onPress={handleRetry}
                  className="mt-6 flex-row items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-xl active:opacity-90"
                >
                  <RefreshCw size={16} color="#ffffff" />
                  <Text className="text-white font-medium text-sm">Volver a Intentar</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
