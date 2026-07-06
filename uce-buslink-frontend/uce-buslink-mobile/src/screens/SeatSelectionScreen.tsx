import { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute as useNavRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft, User, Bus, Clock } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRoute } from '../hooks/useRoute';
import { useTripById } from '../hooks/useTripById';
import { useSeatsByTrip } from '../hooks/useSeatsByTrip';
import { useCreateReservation } from '../hooks/useCreateReservation';
import { fetchBusById, fetchBasicUserInfo } from '../services/tripService';
import type { Seat, ApiReservation } from '../types';
import { SeatMap, BookingSummary, ReservationConfirmModal } from '../components/molecules';
import { Spinner } from '../components/atoms';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';

function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function SeatSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useNavRoute<RouteProp<RootStackParamList, 'SeatSelection'>>();
  const { routeId, tripId } = params;
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

  useEffect(() => {
    let cancelled = false;
    async function loadDetails() {
      if (!trip) return;
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

  const sortedStops = useMemo(() => {
    if (!route?.stops) return [];
    return [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder);
  }, [route?.stops]);

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
      <ScreenContainer>
        <View className="items-center py-20">
          <Spinner />
        </View>
      </ScreenContainer>
    );
  }

  if (notFound || !route || !trip) {
    return (
      <ScreenContainer>
        <View className="items-center py-20">
          <Text className="mb-4 text-gray-400">Viaje no encontrado.</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text className="text-sm text-navy-900 font-semibold">Volver al detalle de ruta</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const tripTime = formatTime(trip.departureTime);
  const selectionLabel = selectedSeat ? `Asiento ${selectedSeat.number}` : null;

  return (
    <ScreenContainer>
      <Pressable onPress={() => navigation.goBack()} className="flex-row items-center gap-1 mb-5">
        <ChevronLeft size={16} color="#6b7280" />
        <Text className="text-sm text-gray-500">Detalle de ruta</Text>
      </Pressable>

      <Text className="text-2xl font-bold text-navy-900 mb-1">
        Confirmar viaje – {route.name}
      </Text>
      <Text className="text-gray-500 text-sm mb-6 capitalize">
        {formatDate(trip.departureTime)} a las {tripTime}
      </Text>

      {seatsError ? <Text className="text-red-500 text-sm mb-4">{seatsError}</Text> : null}

      <View className="gap-6">
        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <Text className="text-sm font-semibold text-navy-900 mb-4">Información del viaje</Text>
          
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center">
              <User size={18} color="#059669" />
            </View>
            <View>
              <Text className="text-xs text-gray-400 font-semibold uppercase">Conductor</Text>
              <Text className="text-sm font-medium text-navy-900">
                {driver ? `${driver.firstName} ${driver.lastName}` : 'Cargando...'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <Bus size={18} color="#2563eb" />
            </View>
            <View>
              <Text className="text-xs text-gray-400 font-semibold uppercase">Unidad</Text>
              <Text className="text-sm font-medium text-navy-900">
                {bus ? `${bus.internalCode} • ${bus.plateNumber}` : 'Cargando...'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center">
              <Clock size={18} color="#d97706" />
            </View>
            <View>
              <Text className="text-xs text-gray-400 font-semibold uppercase">Hora de salida</Text>
              <Text className="text-sm font-medium text-navy-900">{tripTime}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <Text className="text-sm font-semibold text-navy-900 mb-3">Seleccionar parada de embarque</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-2">
            {sortedStops.map(s => {
              const isActive = selectedStopId === s.stopId;
              return (
                <Pressable
                  key={s.stopId}
                  onPress={() => setSelectedStopId(s.stopId)}
                  className={`px-4 py-2 rounded-xl mr-2 border ${
                    isActive ? 'bg-navy-900 border-navy-900' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {s.stopName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <SeatMap
          seats={seats}
          standingSpots={[]}
          selectedStandingId={null}
          onSelectSeat={selectSeat}
          onSelectStanding={() => {}}
        />

        <BookingSummary
          routeName={route.name}
          tripTime={tripTime}
          selectionLabel={selectionLabel}
          hasSelection={hasSelection}
          confirming={confirming}
          onConfirm={handleConfirm}
        />
      </View>

      {confirmError ? <Text className="text-red-500 text-sm mt-4">{confirmError}</Text> : null}

      {confirmedReservation && selectedSeat && (
        <ReservationConfirmModal
          reservation={confirmedReservation}
          seatNumber={selectedSeat.number}
          onClose={() => navigation.navigate('Main', { screen: 'Dashboard' })}
        />
      )}
    </ScreenContainer>
  );
}
