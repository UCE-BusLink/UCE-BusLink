import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useRoute } from '../hooks/useRoute';
import { useTripById } from '../hooks/useTripById';
import { useSeatsByTrip } from '../hooks/useSeatsByTrip';
import { useCreateReservation } from '../hooks/useCreateReservation';
import type { Seat } from '../types';
import { SeatMap, BookingSummary, ReservationConfirmModal } from '../components/molecules';
import { Spinner } from '../components/atoms';
import type { ApiReservation } from '../types';

function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function SeatSelectionPage() {
  const { routeId, tripId } = useParams<{ routeId: string; tripId: string }>();
  const navigate = useNavigate();

  const { route, loading: routeLoading, notFound: routeNotFound } = useRoute(routeId);
  const { trip, loading: tripLoading, notFound: tripNotFound } = useTripById(tripId);
  const { apiSeats, loading: seatsLoading, error: seatsError } = useSeatsByTrip(tripId);
  const { confirm, loading: confirming, error: confirmError } = useCreateReservation();

  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<ApiReservation | null>(null);

  const seats = useMemo<Seat[]>(
    () =>
      apiSeats.map((s) => ({
        number: s.seatNumber,
        status:
          s.seatNumber === selectedSeatNumber
            ? 'selected'
            : s.state !== 'AVAILABLE'
              ? 'occupied'
              : 'available',
      })),
    [apiSeats, selectedSeatNumber]
  );

  const selectedSeat = seats.find((s) => s.status === 'selected') ?? null;
  const selectedSeatApi = apiSeats.find((s) => s.seatNumber === selectedSeat?.number) ?? null;
  const hasSelection = selectedSeat !== null;

  function selectSeat(seatNumber: number) {
    setSelectedSeatNumber((prev) => (prev === seatNumber ? null : seatNumber));
  }

  async function handleConfirm() {
    if (!tripId || !selectedSeatApi) return;
    const boardingStopId = route?.stops?.[0]?.stopId;
    if (!boardingStopId) return;
    const result = await confirm(tripId, selectedSeatApi.id, boardingStopId);
    if (result) setConfirmedReservation(result);
  }

  const isLoading = routeLoading || tripLoading || seatsLoading;
  const notFound = routeNotFound || tripNotFound;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (notFound || !route || !trip) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Viaje no encontrado.</p>
        <button
          onClick={() => navigate(`/routes/${routeId}`)}
          className="text-sm text-navy-900 font-semibold hover:underline"
        >
          Volver al detalle de ruta
        </button>
      </div>
    );
  }

  const tripTime = formatTime(trip.departureTime);
  const selectionLabel = selectedSeat ? `Asiento ${selectedSeat.number}` : null;

  return (
    <div>
      <button
        onClick={() => navigate(`/routes/${routeId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-navy-900 transition-colors mb-5"
      >
        <ChevronLeft size={16} />
        Detalle de ruta
      </button>

      <h1 className="text-2xl font-bold text-navy-900 mb-1">
        Seleccionar lugar – {route.name} ({tripTime})
      </h1>
      <p className="text-gray-500 text-sm mb-8">Elige un asiento para tu viaje</p>

      {seatsError && <p className="text-red-500 text-sm mb-4">{seatsError}</p>}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <SeatMap
            seats={seats}
            standingSpots={[]}
            selectedStandingId={null}
            onSelectSeat={selectSeat}
            onSelectStanding={() => {}}
          />
        </div>
        <BookingSummary
          routeName={route.name}
          tripTime={tripTime}
          selectionLabel={selectionLabel}
          hasSelection={hasSelection}
          confirming={confirming}
          onConfirm={handleConfirm}
        />
      </div>

      {confirmError && <p className="text-red-500 text-sm mt-4">{confirmError}</p>}

      {confirmedReservation && selectedSeat && (
        <ReservationConfirmModal
          reservation={confirmedReservation}
          seatNumber={selectedSeat.number}
          onClose={() => navigate('/dashboard')}
        />
      )}
    </div>
  );
}
