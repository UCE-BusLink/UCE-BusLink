import { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation, useRoute as useNavRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useRoute } from '../hooks/useRoute';
import { useTripById } from '../hooks/useTripById';
import { useSeatsByTrip } from '../hooks/useSeatsByTrip';
import { useCreateReservation } from '../hooks/useCreateReservation';
import type { Seat, ApiReservation } from '../types';
import { SeatMap, BookingSummary, ReservationConfirmModal } from '../components/molecules';
import { Spinner } from '../components/atoms';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';

function formatTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function SeatSelectionScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useNavRoute<RouteProp<RootStackParamList, 'SeatSelection'>>();
  const { routeId, tripId } = params;

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
        Seleccionar lugar – {route.name} ({tripTime})
      </Text>
      <Text className="text-gray-500 text-sm mb-8">Elige un asiento para tu viaje</Text>

      {seatsError ? <Text className="text-red-500 text-sm mb-4">{seatsError}</Text> : null}

      <View className="gap-6">
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
