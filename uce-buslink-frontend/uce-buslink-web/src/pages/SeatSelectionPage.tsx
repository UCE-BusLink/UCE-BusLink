import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bus as BusIcon, User, Clock } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useRoute } from '../hooks/useRoute';
import { useTripById } from '../hooks/useTripById';
import { useSeatsByTrip } from '../hooks/useSeatsByTrip';
import { useCreateReservation } from '../hooks/useCreateReservation';
import { fetchBusById, fetchBasicUserInfo } from '../services/tripService';
import type { Seat } from '../types';
import { SeatMap, BookingSummary, ReservationConfirmModal, LeafletMap } from '../components/molecules';
import { Spinner } from '../components/atoms';
import type { ApiReservation } from '../types';

function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatDate(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function SeatSelectionPage() {
  const { routeId, tripId } = useParams<{ routeId: string; tripId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { route, loading: routeLoading, notFound: routeNotFound } = useRoute(routeId);
  const { trip, loading: tripLoading, notFound: tripNotFound } = useTripById(tripId);
  const { apiSeats, loading: seatsLoading, error: seatsError } = useSeatsByTrip(tripId);
  const { confirm, loading: confirming, error: confirmError } = useCreateReservation();

  const [selectedSeatNumber, setSelectedSeatNumber] = useState<number | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<ApiReservation | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const [bus, setBus] = useState<{ plateNumber: string; internalCode: string } | null>(null);
  const [driver, setDriver] = useState<{ firstName: string; lastName: string } | null>(null);
  const [, setLoadingDetails] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      if (!trip) return;
      setLoadingDetails(true);
      try {
        const token = await getToken({ template: 'uce-buslink' });
        if (!token) return;

        if (trip.busId && !bus) {
          fetchBusById(token, trip.busId)
            .then(data => { if (!cancelled) setBus(data); })
            .catch(err => console.error(err));
        }

        if (trip.driverId && !driver) {
          fetchBasicUserInfo(token, trip.driverId)
            .then(data => { if (!cancelled) setDriver(data); })
            .catch(err => console.error(err));
        }
      } catch (e) {
        console.error(e);
      }
      if (!cancelled) setLoadingDetails(false);
    }
    loadDetails();
    return () => { cancelled = true; };
  }, [trip, getToken, bus, driver]);

  useEffect(() => {
    if (route?.stops && route.stops.length > 0 && !selectedStopId) {
      const sorted = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder);
      setSelectedStopId(sorted[0].stopId);
    }
  }, [route, selectedStopId]);

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
    if (!tripId || !selectedSeatApi || !selectedStopId) return;
    const result = await confirm(tripId, selectedSeatApi.id, selectedStopId);
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

  if (trip.state === 'COMPLETED' || trip.state === 'CANCELLED') {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-bold text-navy-900 mb-2">
          {trip.state === 'COMPLETED' ? 'Este viaje ya finalizó' : 'Este viaje fue cancelado'}
        </p>
        <p className="text-sm text-gray-500 mb-6">Ya no es posible reservar asientos para este viaje.</p>
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
  
  const sortedStops = [...(route.stops || [])].sort((a, b) => a.stopOrder - b.stopOrder);

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
        Confirmar viaje – {route.name}
      </h1>
      <p className="text-gray-500 text-sm mb-8 capitalize">{formatDate(trip.departureTime)} a las {tripTime}</p>

      {seatsError && <p className="text-red-500 text-sm mb-4">{seatsError}</p>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-navy-900 mb-4">Información del viaje</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Conductor</p>
                  <p className="text-sm font-medium text-navy-900">
                    {driver ? `${driver.firstName} ${driver.lastName}` : 'Cargando...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <BusIcon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Unidad</p>
                  <p className="text-sm font-medium text-navy-900">
                    {bus ? `${bus.internalCode} • ${bus.plateNumber}` : 'Cargando...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Hora de salida</p>
                  <p className="text-sm font-medium text-navy-900">{tripTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-navy-900 mb-4">Seleccionar parada de embarque</h2>
            <select
              className="w-full bg-gray-50 border border-gray-200 text-navy-900 text-sm rounded-xl focus:ring-navy-500 focus:border-navy-500 block p-3 outline-none mb-4 font-medium"
              value={selectedStopId || ''}
              onChange={e => setSelectedStopId(e.target.value)}
            >
              {sortedStops.map(s => (
                <option key={s.stopId} value={s.stopId}>{s.stopName}</option>
              ))}
            </select>
            <LeafletMap 
              selectedRoute={route} 
              loading={routeLoading} 
              selectedStopId={selectedStopId} 
              onStopSelect={setSelectedStopId} 
            />
          </div>

          <SeatMap
            seats={seats}
            standingSpots={[]}
            selectedStandingId={null}
            onSelectSeat={selectSeat}
            onSelectStanding={() => {}}
          />
        </div>
        
        <div className="space-y-6">
          <BookingSummary
            routeName={route.name}
            tripTime={tripTime}
            selectionLabel={selectionLabel}
            hasSelection={hasSelection}
            confirming={confirming}
            onConfirm={handleConfirm}
          />
          {confirmError && <p className="text-red-500 text-sm mt-4">{confirmError}</p>}
        </div>
      </div>

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
