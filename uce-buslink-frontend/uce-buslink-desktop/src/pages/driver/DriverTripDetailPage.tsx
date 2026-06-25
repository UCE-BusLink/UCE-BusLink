import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useDriverTripPassengers } from '../../hooks/useDriverTripPassengers';
import { PassengerRow, QrScannerModal } from '../../components/molecules';
import { Spinner } from '../../components/atoms';
import { scanReservation, adminCancelReservation } from '../../services/driverService';

export function DriverTripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { passengers, loading, error, refetch } = useDriverTripPassengers(tripId!);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  async function handleCancel(reservationId: string) {
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setCancellingId(reservationId);
    await adminCancelReservation(token, reservationId, 'Cancelado por el conductor')
      .then(() => refetch())
      .catch(() => undefined)
      .finally(() => setCancellingId(null));
  }

  const handleScan = useCallback(
    async (reservationId: string) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No token');
      await scanReservation(token, reservationId);
      await refetch();
    },
    [getToken, refetch]
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
          <h1 className="text-2xl font-bold text-navy-900">Pasajeros</h1>
          <p className="text-gray-500 text-sm mt-0.5">Lista de reservas para este viaje.</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setScannerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 text-white text-sm font-semibold rounded-xl hover:bg-navy-800 transition-colors"
        >
          <QrCode size={16} />
          Escanear QR
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : passengers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
          <p className="text-sm">No hay pasajeros registrados para este viaje.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-2">
          {passengers.map((passenger) => (
            <PassengerRow
              key={passenger.reservationId}
              passenger={passenger}
              onCancel={() => handleCancel(passenger.reservationId)}
              cancelling={cancellingId === passenger.reservationId}
            />
          ))}
        </div>
      )}

      {scannerOpen && (
        <QrScannerModal
          onScan={handleScan}
          onClose={() => { setScannerOpen(false); refetch(); }}
        />
      )}
    </div>
  );
}
