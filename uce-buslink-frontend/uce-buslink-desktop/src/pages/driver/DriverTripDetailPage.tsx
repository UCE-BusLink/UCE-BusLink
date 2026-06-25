import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, UserX } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useDriverTrip } from '../../hooks/useDriverTrip';
import { TripSummaryCard, QrScannerModal } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { scanReservation, adminCancelReservation } from '../../services/driverService';

type ScannerMode = 'board' | 'cancel' | null;

export function DriverTripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { trip, loading, error } = useDriverTrip(tripId!);
  const [scannerMode, setScannerMode] = useState<ScannerMode>(null);

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
          <p className="text-gray-500 text-sm mt-0.5">Escanea el QR del pasajero para abordar o cancelar.</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setScannerMode('board')}
              className="flex items-center justify-center gap-2 px-4 py-4 bg-navy-900 text-white text-sm font-semibold rounded-2xl hover:bg-navy-800 transition-colors"
            >
              <QrCode size={18} />
              Abordar pasajero
            </button>
            <button
              onClick={() => setScannerMode('cancel')}
              className="flex items-center justify-center gap-2 px-4 py-4 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-2xl hover:bg-red-50 transition-colors"
            >
              <UserX size={18} />
              Cancelar reserva
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Apunta la cámara al código QR del estudiante. La acción se aplica al escanear.
          </p>
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
