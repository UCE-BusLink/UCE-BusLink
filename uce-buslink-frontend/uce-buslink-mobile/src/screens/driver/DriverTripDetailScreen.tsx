import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation, useRoute as useNavRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, QrCode, Play, Square, Radio } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useDriverTrip } from '../../hooks/useDriverTrip';
import { useRoute } from '../../hooks/useRoute';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';
import { useDriverLocationPublisher } from '../../hooks/useDriverLocationPublisher';
import { TripSummaryCard, QrScannerModal, LeafletMap } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { scanReservation, adminCancelReservation, changeTripState } from '../../services/driverService';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import type { RootStackParamList } from '../../navigation/types';

type ScannerMode = 'board' | 'cancel' | null;

export function DriverTripDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useNavRoute<RouteProp<RootStackParamList, 'DriverTripDetail'>>();
  const tripId = params.tripId;
  const { getToken } = useAuth();
  const { trip, loading, error, setTrip } = useDriverTrip(tripId);
  const [scannerMode, setScannerMode] = useState<ScannerMode>(null);
  const [updatingState, setUpdatingState] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  const isOngoing = trip?.state === 'ONGOING';
  const { client, isConnected } = useTrackingConnection(isOngoing);
  const position = useDriverLocationPublisher(client, isConnected, trip?.busId ?? null, !!isOngoing);
  const { route } = useRoute(isOngoing ? trip?.routeId : undefined);

  const handleBoard = useCallback(
    async (reservationId: string) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await scanReservation(token, reservationId);
    },
    [getToken]
  );

  const handleCancel = useCallback(
    async (reservationId: string) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await adminCancelReservation(token, reservationId, 'Cancelado por el conductor');
    },
    [getToken]
  );

  const handleStart = useCallback(async () => {
    if (!tripId) return;
    setUpdatingState(true);
    setStateError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await changeTripState(token, tripId, 'ONGOING');
      setTrip((prev) => (prev ? { ...prev, state: 'ONGOING' } : prev));
    } catch (err) {
      setStateError(err instanceof Error ? err.message : 'No se pudo iniciar el viaje.');
    } finally {
      setUpdatingState(false);
    }
  }, [tripId, getToken, setTrip]);

  const handleComplete = useCallback(async () => {
    if (!tripId) return;
    setUpdatingState(true);
    setStateError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await changeTripState(token, tripId, 'COMPLETED');
      setTrip((prev) => (prev ? { ...prev, state: 'COMPLETED' } : prev));
    } catch (err) {
      setStateError(err instanceof Error ? err.message : 'No se pudo finalizar el viaje.');
    } finally {
      setUpdatingState(false);
    }
  }, [tripId, getToken, setTrip]);

  return (
    <ScreenContainer>
      <View className="mb-7 flex-row items-center gap-3">
        <Pressable onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#9ca3af" />
        </Pressable>
        <View>
          <Text className="text-2xl font-bold text-navy-900">Detalle del viaje</Text>
          <Text className="text-gray-500 text-sm mt-0.5">Inicia el viaje y escanea el QR del pasajero.</Text>
        </View>
      </View>

      {loading ? (
        <View className="items-center py-12"><Spinner /></View>
      ) : error || !trip ? (
        <View className="bg-white rounded-2xl border border-red-100 p-6 items-center">
          <Text className="text-sm text-red-500">{error ?? 'Viaje no encontrado.'}</Text>
        </View>
      ) : (
        <View className="gap-5">
          <TripSummaryCard trip={trip} />

          {isOngoing && (
            <View
              className={`flex-row items-center gap-2 px-4 py-3 rounded-2xl border ${
                isConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <Radio size={16} color={isConnected ? '#047857' : '#b45309'} />
              <Text className={`text-sm font-semibold ${isConnected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isConnected ? 'Enviando ubicación en tiempo real' : 'Conectando para enviar ubicación...'}
              </Text>
            </View>
          )}

          {isOngoing && (
            <LeafletMap selectedRoute={route} loading={false} liveBus={position} liveBusTitle="Tu ubicación" />
          )}

          {trip.state === 'SCHEDULED' && (
            <Pressable
              onPress={handleStart}
              disabled={updatingState}
              className={`w-full flex-row items-center justify-center gap-2 px-4 py-4 bg-emerald-600 rounded-2xl ${updatingState ? 'opacity-50' : ''}`}
            >
              <Play size={18} color="#ffffff" />
              <Text className="text-white text-sm font-semibold">{updatingState ? 'Iniciando...' : 'Iniciar viaje'}</Text>
            </Pressable>
          )}

          {isOngoing && (
            <Pressable
              onPress={handleComplete}
              disabled={updatingState}
              className={`w-full flex-row items-center justify-center gap-2 px-4 py-4 bg-red-600 rounded-2xl ${updatingState ? 'opacity-50' : ''}`}
            >
              <Square size={18} color="#ffffff" />
              <Text className="text-white text-sm font-semibold">{updatingState ? 'Finalizando...' : 'Finalizar viaje'}</Text>
            </Pressable>
          )}

          {stateError ? <Text className="text-xs text-red-500 text-center">{stateError}</Text> : null}

          {(trip.state === 'SCHEDULED' || isOngoing) && (
            <>
              <Pressable
                onPress={() => setScannerMode('board')}
                className="flex-row items-center justify-center gap-2 px-4 py-4 bg-navy-900 rounded-2xl active:bg-navy-800"
              >
                <QrCode size={18} color="#ffffff" />
                <Text className="text-white text-sm font-semibold">Abordar pasajero</Text>
              </Pressable>

              <Text className="text-xs text-gray-400 text-center">
                Apunta la cámara al código QR del estudiante. La acción se aplica al escanear.
              </Text>
            </>
          )}
        </View>
      )}

      {scannerMode === 'board' && (
        <QrScannerModal
          title="Abordar pasajero"
          successMessage="Pasajero marcado como abordado."
          onScan={handleBoard}
          onClose={() => setScannerMode(null)}
        />
      )}

      {scannerMode === 'cancel' && (
        <QrScannerModal
          title="Cancelar reserva"
          successMessage="Reserva cancelada correctamente."
          onScan={handleCancel}
          onClose={() => setScannerMode(null)}
        />
      )}
    </ScreenContainer>
  );
}
