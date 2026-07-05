import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Play, Square, Radio, MapPin, User, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useDriverTrip } from '../../hooks/useDriverTrip';
import { useRoute } from '../../hooks/useRoute';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';
import { useDriverLocationPublisher } from '../../hooks/useDriverLocationPublisher';
import { TripSummaryCard, QrScannerModal, LeafletMap } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { scanReservation, adminCancelReservation, changeTripState, fetchTripPassengers } from '../../services/driverService';
import type { DriverPassengerResponse } from '../../types';

type ScannerMode = 'board' | 'cancel' | null;

export function DriverTripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { trip, loading, error, setTrip } = useDriverTrip(tripId!);
  const [scannerMode, setScannerMode] = useState<ScannerMode>(null);
  const [updatingState, setUpdatingState] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);
  
  const [passengers, setPassengers] = useState<DriverPassengerResponse[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // We want to fetch the route even if it's not ongoing to show the stops
  const { route } = useRoute(trip?.routeId);
  const isOngoing = trip?.state === 'ONGOING';
  const { client, isConnected } = useTrackingConnection(isOngoing);
  const position = useDriverLocationPublisher(client, isConnected, trip?.busId ?? null, isOngoing);

  // Update current time every 10 seconds for the button disable logic
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
      await loadPassengers(); // Refresh passengers list
    },
    [getToken, loadPassengers]
  );

  const handleCancel = useCallback(
    async (reservationId: string) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await adminCancelReservation(token, reservationId, 'Cancelado por el conductor');
      await loadPassengers(); // Refresh passengers list
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

  const canStartTrip = trip ? (() => {
    const departure = new Date(trip.departureTime);
    const tenMinsBefore = new Date(departure.getTime() - 10 * 60000);
    return currentTime >= tenMinsBefore;
  })() : false;

  return (
    <div className="pb-8">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/driver')}
          className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-navy-900 hover:bg-gray-50 hover:shadow-sm transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-navy-900 tracking-tight">Detalle del viaje</h1>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">Gestiona el progreso y los pasajeros.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error || !trip ? (
        <div className="bg-white rounded-3xl border border-red-100 p-10 text-center shadow-sm">
          <p className="text-red-500 font-semibold text-lg">{error ?? 'Viaje no encontrado.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <TripSummaryCard trip={trip} />

            {isOngoing && (
              <div
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold shadow-sm transition-all ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <div className={`p-2 rounded-full ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  <Radio size={20} className={isConnected ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <p className="text-base">{isConnected ? 'Transmitiendo ubicación en vivo' : 'Conectando al satélite...'}</p>
                  <p className="font-medium opacity-75">{isConnected ? 'Los estudiantes pueden ver tu progreso.' : 'Espera un momento, por favor.'}</p>
                </div>
              </div>
            )}

            {isOngoing && route && (
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <LeafletMap
                  selectedRoute={route}
                  loading={false}
                  liveBus={position}
                  liveBusTitle="Tu ubicación actual"
                />
              </div>
            )}

            {trip.state === 'SCHEDULED' && (
              <div className="space-y-2">
                <button
                  onClick={handleStart}
                  disabled={updatingState || !canStartTrip}
                  className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg font-bold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none active:scale-[0.98]"
                >
                  <Play size={24} fill="currentColor" />
                  {updatingState ? 'Iniciando viaje...' : 'INICIAR VIAJE AHORA'}
                </button>
                {!canStartTrip && (
                  <p className="text-center text-sm text-gray-500 font-medium animate-pulse">
                    Disponible 10 minutos antes de la hora de salida.
                  </p>
                )}
              </div>
            )}

            {isOngoing && (
              <button
                onClick={handleComplete}
                disabled={updatingState}
                className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold rounded-2xl hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                <Square size={24} fill="currentColor" />
                {updatingState ? 'Finalizando...' : 'FINALIZAR VIAJE'}
              </button>
            )}

            {stateError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                <p className="text-sm font-medium text-red-600">{stateError}</p>
              </div>
            )}

            {(trip.state === 'SCHEDULED' || isOngoing) && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center">
                <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                  <QrCode size={32} />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Escanear código QR</h3>
                <p className="text-gray-500 text-center text-sm mb-6 max-w-sm">
                  Utiliza la cámara de tu dispositivo para registrar rápidamente a los estudiantes que abordan el autobús.
                </p>
                <button
                  onClick={() => setScannerMode('board')}
                  className="w-full sm:w-auto px-8 py-4 bg-navy-900 text-white text-base font-bold rounded-2xl hover:bg-primary hover:shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <QrCode size={20} />
                  ABRIR ESCÁNER
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sticky top-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-black text-navy-900 mb-6 flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                Paradas de la Ruta
              </h3>
              
              {route?.stops && route.stops.length > 0 ? (
                <div className="relative border-l-2 border-gray-100 ml-3 pl-6 space-y-8">
                  {route.stops
                    .slice()
                    .sort((a, b) => a.stopOrder - b.stopOrder)
                    .map((stop, index) => {
                      const stopPassengers = passengers.filter(p => p.boardingStopId === stop.stopId);
                      
                      return (
                        <div key={stop.stopId} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white shadow-sm ${index === 0 || index === route.stops!.length - 1 ? 'bg-primary w-5 h-5 -left-[33px]' : 'bg-gray-300'}`}></div>
                          
                          <div>
                            <h4 className={`font-bold ${index === 0 || index === route.stops!.length - 1 ? 'text-navy-900' : 'text-gray-700'}`}>
                              {stop.stopName}
                            </h4>
                            {stop.estimatedMinutesFromStart !== null && (
                              <p className="text-xs text-gray-500 mt-1 font-medium">
                                +{stop.estimatedMinutesFromStart} min
                              </p>
                            )}
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1 mb-3">
                              Parada #{stop.stopOrder}
                            </p>
                            
                            {/* Passengers List */}
                            {stopPassengers.length > 0 && (
                              <div className="space-y-2 mt-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                {stopPassengers.map(p => (
                                  <div key={p.reservationId} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <div className={`p-1.5 rounded-full ${p.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                        <User size={14} />
                                      </div>
                                      <span className="text-sm font-bold text-navy-900">{p.studentName}</span>
                                    </div>
                                    <div>
                                      {p.status === 'COMPLETED' ? (
                                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                          <CheckCircle2 size={14} />
                                          <span>A bordo</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-amber-600 text-xs font-bold animate-pulse">
                                          <Clock size={14} />
                                          <span>Pendiente</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-8">
                  Cargando paradas o ruta sin paradas definidas...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {scannerMode === 'board' && (
        <QrScannerModal
          title="Registro de Pasajero"
          successMessage="¡Pasajero registrado exitosamente! Puede ingresar."
          onScan={handleBoard}
          onClose={() => setScannerMode(null)}
        />
      )}

      {scannerMode === 'cancel' && (
        <QrScannerModal
          title="Cancelar Reserva"
          successMessage="Reserva cancelada correctamente."
          onScan={handleCancel}
          onClose={() => setScannerMode(null)}
        />
      )}
    </div>
  );
}
