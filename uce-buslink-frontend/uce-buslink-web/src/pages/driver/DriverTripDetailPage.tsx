import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Play, Square, Radio } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useDriverTrip } from '../../hooks/useDriverTrip';
import { useRoute } from '../../hooks/useRoute';
import { useTrackingConnection } from '../../hooks/useTrackingConnection';
import { useDriverLocationPublisher } from '../../hooks/useDriverLocationPublisher';
import { TripSummaryCard, QrScannerModal, LeafletMap } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { scanReservation, adminCancelReservation, changeTripState } from '../../services/driverService';

type ScannerMode = 'board' | 'cancel' | null;

export function DriverTripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { trip, loading, error, setTrip } = useDriverTrip(tripId!);
  const [scannerMode, setScannerMode] = useState<ScannerMode>(null);
  const [updatingState, setUpdatingState] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  const isOngoing = trip?.state === 'ONGOING';
  const { client, isConnected } = useTrackingConnection(isOngoing);
  const position = useDriverLocationPublisher(client, isConnected, trip?.busId ?? null, isOngoing);
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
    <div>
      <div className="mb-7 flex items-center gap-3">
        <button
          onClick={() => navigate('/driver')}
          className="text-gray-400 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Detalle del viaje</h1>
          <p className="text-gray-500 text-sm mt-0.5">Inicia el viaje y escanea el QR del pasajero.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error || !trip ? (
        <div className="bg-white rounded-2xl border border-red-100 p-6 text-center">
          <p className="text-sm text-red-500">{error ?? 'Viaje no encontrado.'}</p>
        </div>
      ) : (
        <div className="space-y-5 max-w-xl">
          <TripSummaryCard trip={trip} />

          {isOngoing && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <Radio size={16} className={isConnected ? 'animate-pulse' : ''} />
              {isConnected
                ? 'Enviando ubicación en tiempo real'
                : 'Conectando para enviar ubicación...'}
            </div>
          )}

          {isOngoing && (
            <LeafletMap
              selectedRoute={route}
              loading={false}
              liveBus={position}
              liveBusTitle="Tu ubicación"
            />
          )}

          {trip.state === 'SCHEDULED' && (
            <button
              onClick={handleStart}
              disabled={updatingState}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 text-white text-sm font-semibold rounded-2xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Play size={18} />
              {updatingState ? 'Iniciando...' : 'Iniciar viaje'}
            </button>
          )}

          {isOngoing && (
            <button
              onClick={handleComplete}
              disabled={updatingState}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-600 text-white text-sm font-semibold rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Square size={18} />
              {updatingState ? 'Finalizando...' : 'Finalizar viaje'}
            </button>
          )}

          {stateError && <p className="text-xs text-red-500 text-center">{stateError}</p>}

          {(trip.state === 'SCHEDULED' || isOngoing) && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setScannerMode('board')}
                  className="flex items-center justify-center gap-2 px-4 py-4 bg-navy-900 text-white text-sm font-semibold rounded-2xl hover:bg-navy-800 transition-colors"
                >
                  <QrCode size={18} />
                  Abordar pasajero
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Apunta la cámara al código QR del estudiante. La acción se aplica al escanear.
              </p>
            </>
          )}
        </div>
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
    </div>
  );
}
