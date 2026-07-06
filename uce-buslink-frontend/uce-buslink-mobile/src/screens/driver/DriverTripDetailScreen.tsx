import { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute as useNavRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ArrowLeft, QrCode, Play, Square, Radio, MapPin, User, CheckCircle2, Clock } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useDriverTrip } from '../../hooks/useDriverTrip';
import { useRoute } from '../../hooks/useRoute';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';
import { useDriverLocationPublisher } from '../../hooks/useDriverLocationPublisher';
import { useTripSimulation } from '../../hooks/useTripSimulation';
import { TripSummaryCard, QrScannerModal, LeafletMap } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { scanReservation, adminCancelReservation, changeTripState, fetchTripPassengers } from '../../services/driverService';
import type { DriverPassengerResponse } from '../../types';
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
  const [isSimulating, setIsSimulating] = useState(false);
  const [passengers, setPassengers] = useState<DriverPassengerResponse[]>([]);
  const [, setLoadingPassengers] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const { route } = useRoute(trip?.routeId);
  const isOngoing = trip?.state === 'ONGOING';
  
  const simulatedPosition = useTripSimulation({ route: route ?? null, isSimulating });
  
  const { client, isConnected } = useTrackingConnection(isOngoing);
  const position = useDriverLocationPublisher(
    client, 
    isConnected, 
    trip?.busId ?? null, 
    !!isOngoing,
    isSimulating,
    simulatedPosition
  );

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadPassengers = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoadingPassengers(true);
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) return;
      const data = await fetchTripPassengers(token, tripId);
      setPassengers(data);
    } catch (err) {
      console.error("Error fetching passengers:", err);
    } finally {
      setLoadingPassengers(false);
    }
  }, [tripId, getToken]);

  useEffect(() => {
    loadPassengers();
  }, [loadPassengers]);

  const handleBoard = useCallback(
    async (reservationId: string) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await scanReservation(token, reservationId);
      await loadPassengers();
    },
    [getToken, loadPassengers]
  );

  const handleCancel = useCallback(
    async (reservationId: string) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await adminCancelReservation(token, reservationId, 'Cancelado por el conductor');
      await loadPassengers();
    },
    [getToken, loadPassengers]
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
      setIsSimulating(false);
    } catch (err) {
      setStateError(err instanceof Error ? err.message : 'No se pudo iniciar el viaje.');
    } finally {
      setUpdatingState(false);
    }
  }, [tripId, getToken, setTrip]);

  const handleSimulate = useCallback(async () => {
    if (!tripId) return;
    setUpdatingState(true);
    setStateError(null);
    try {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await changeTripState(token, tripId, 'ONGOING');
      setTrip((prev) => (prev ? { ...prev, state: 'ONGOING' } : prev));
      setIsSimulating(true);
    } catch (err) {
      setStateError(err instanceof Error ? err.message : 'No se pudo simular el viaje.');
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
      setIsSimulating(false);
    } catch (err) {
      setStateError(err instanceof Error ? err.message : 'No se pudo finalizar el viaje.');
    } finally {
      setUpdatingState(false);
    }
  }, [tripId, getToken, setTrip]);

  const canStartTrip = trip ? (() => {
    const departure = new Date(trip.departureTime);
    const tenMinsBefore = new Date(departure.getTime() - 10 * 60000);
    return currentTime >= tenMinsBefore;
  })() : false;

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
              className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl border ${
                isConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <View className={`p-1.5 rounded-full ${isConnected ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <Radio size={16} color={isConnected ? '#059669' : '#d97706'} />
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-bold ${isConnected ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {isConnected 
                    ? (isSimulating ? 'SIMULACIÓN EN CURSO' : 'Transmitiendo ubicación') 
                    : 'Conectando al satélite...'}
                </Text>
                <Text className={`text-xs ${isConnected ? 'text-emerald-700 opacity-75' : 'text-amber-700 opacity-75'}`}>
                  {isConnected 
                    ? (isSimulating ? `Velocidad: ${simulatedPosition?.velocity || 0} km/h` : 'Progreso en vivo') 
                    : 'Espera un momento...'}
                </Text>
              </View>
            </View>
          )}

          {isOngoing && route && (
            <LeafletMap selectedRoute={route} loading={false} liveBus={position} liveBusTitle="Tu ubicación" />
          )}

          {trip.state === 'SCHEDULED' && (
            <View className="gap-3">
              <Pressable
                onPress={handleStart}
                disabled={updatingState || !canStartTrip}
                className={`w-full flex-row items-center justify-center gap-2 px-4 py-4 rounded-2xl ${
                  updatingState || !canStartTrip ? 'bg-gray-400' : 'bg-emerald-600 active:bg-emerald-700'
                }`}
              >
                <Play size={18} color="#ffffff" />
                <Text className="text-white text-sm font-bold">
                  {updatingState ? 'Iniciando...' : 'INICIAR VIAJE AHORA'}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSimulate}
                disabled={updatingState || !canStartTrip}
                className={`w-full flex-row items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 ${
                  updatingState || !canStartTrip ? 'border-gray-200 bg-gray-50' : 'border-purple-200 bg-purple-50 active:bg-purple-100'
                }`}
              >
                <Play size={16} color={updatingState || !canStartTrip ? '#9ca3af' : '#7e22ce'} />
                <Text className={`text-sm font-bold ${updatingState || !canStartTrip ? 'text-gray-400' : 'text-purple-700'}`}>
                  SIMULAR VIAJE (PRUEBA)
                </Text>
              </Pressable>

              {!canStartTrip && (
                <Text className="text-center text-xs text-gray-500 font-medium mt-1">
                  Disponible 10 minutos antes de la hora de salida.
                </Text>
              )}
            </View>
          )}

          {isOngoing && (
            <Pressable
              onPress={handleComplete}
              disabled={updatingState}
              className={`w-full flex-row items-center justify-center gap-2 px-4 py-4 rounded-2xl ${
                updatingState ? 'bg-gray-400' : 'bg-red-600 active:bg-red-700'
              }`}
            >
              <Square size={18} color="#ffffff" />
              <Text className="text-white text-sm font-bold">
                {updatingState ? 'Finalizando...' : 'FINALIZAR VIAJE'}
              </Text>
            </Pressable>
          )}

          {stateError ? <Text className="text-xs text-red-500 text-center">{stateError}</Text> : null}

          {(trip.state === 'SCHEDULED' || isOngoing) && (
            <View className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm items-center mt-2">
              <View className="p-3 bg-blue-50 rounded-full mb-3">
                <QrCode size={24} color="#2563eb" />
              </View>
              <Text className="text-lg font-bold text-navy-900 mb-1">Escanear código QR</Text>
              <Text className="text-gray-500 text-center text-xs mb-5">
                Utiliza la cámara para registrar rápidamente a los estudiantes.
              </Text>
              <Pressable
                onPress={() => setScannerMode('board')}
                className="w-full flex-row items-center justify-center gap-2 px-4 py-4 bg-navy-900 rounded-2xl active:bg-navy-800"
              >
                <QrCode size={18} color="#ffffff" />
                <Text className="text-white text-sm font-bold">ABRIR ESCÁNER</Text>
              </Pressable>
            </View>
          )}

          {/* Passenger Manifest */}
          <View className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 mt-2">
            <View className="flex-row items-center gap-2 mb-5">
              <MapPin size={18} color="#2563eb" />
              <Text className="text-base font-black text-navy-900">Paradas de la Ruta</Text>
            </View>
            
            {route?.stops && route.stops.length > 0 ? (
              <View className="pl-3 border-l-2 border-gray-100 ml-1">
                {route.stops
                  .slice()
                  .sort((a, b) => a.stopOrder - b.stopOrder)
                  .map((stop, index) => {
                    const stopPassengers = passengers.filter(p => p.boardingStopId === stop.stopId);
                    const isFirstOrLast = index === 0 || index === route.stops!.length - 1;

                    return (
                      <View key={stop.stopId} className="mb-6">
                        <View className={`absolute -left-[18px] w-3 h-3 rounded-full border-2 border-white ${isFirstOrLast ? 'bg-blue-600 -left-[19px] w-3.5 h-3.5' : 'bg-gray-300'}`} />
                        <View className="pl-3">
                          <Text className={`font-bold ${isFirstOrLast ? 'text-navy-900' : 'text-gray-700'}`}>
                            {stop.stopName}
                          </Text>
                          {stop.estimatedMinutesFromStart !== null && (
                            <Text className="text-xs text-gray-500 font-medium">+{stop.estimatedMinutesFromStart} min</Text>
                          )}
                          <Text className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5 mb-2">Parada #{stop.stopOrder}</Text>
                          
                          {stopPassengers.length > 0 && (
                            <View className="bg-gray-50 rounded-xl p-2 border border-gray-100 gap-2 mt-1">
                              {stopPassengers.map(p => (
                                <View key={p.reservationId} className="flex-row items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100">
                                  <View className="flex-row items-center gap-2 flex-1">
                                    <View className={`p-1.5 rounded-full ${p.status === 'COMPLETED' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                      <User size={12} color={p.status === 'COMPLETED' ? '#059669' : '#d97706'} />
                                    </View>
                                    <Text className="text-xs font-bold text-navy-900 flex-1" numberOfLines={1}>{p.studentName}</Text>
                                  </View>
                                  <View>
                                    {p.status === 'COMPLETED' ? (
                                      <View className="flex-row items-center gap-1">
                                        <CheckCircle2 size={12} color="#059669" />
                                        <Text className="text-[10px] text-emerald-600 font-bold">A bordo</Text>
                                      </View>
                                    ) : (
                                      <View className="flex-row items-center gap-1 opacity-70">
                                        <Clock size={12} color="#d97706" />
                                        <Text className="text-[10px] text-amber-600 font-bold">Pendiente</Text>
                                      </View>
                                    )}
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
              </View>
            ) : (
              <Text className="text-sm text-gray-500 italic text-center py-4">Cargando paradas...</Text>
            )}
          </View>
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
