import { View, Text, Pressable } from 'react-native';
import { Bus } from 'lucide-react-native';
import { SeatButton, LegendItem } from '../atoms';
import type { Seat, StandingSpot } from '../../types';

interface SeatMapProps {
  seats: Seat[];
  standingSpots: StandingSpot[];
  selectedStandingId: number | null;
  onSelectSeat: (seatNumber: number) => void;
  onSelectStanding: (spotId: number) => void;
}

export function SeatMap({
  seats,
  standingSpots,
  selectedStandingId,
  onSelectSeat,
  onSelectStanding,
}: SeatMapProps) {
  const leftSeats = seats.filter((s) => [1, 2, 5, 6, 9, 10].includes(s.number));
  const rightSeats = seats.filter((s) => [3, 4, 7, 8, 11, 12].includes(s.number));

  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <Text className="text-sm font-semibold text-navy-900 mb-6">Mapa de Asientos</Text>

      <View className="items-center">
        <View className="relative">
          <View className="absolute -top-1 right-0 z-10 w-8 h-8 bg-gray-100 rounded-lg items-center justify-center">
            <Bus size={14} color="#6b7280" />
          </View>
          <View className="flex-row gap-8 bg-gray-50 rounded-xl p-6 mt-2">
            <View className="flex-row flex-wrap gap-2 w-[88px]">
              {leftSeats.map((seat) => (
                <SeatButton key={seat.number} seat={seat} onSelect={() => onSelectSeat(seat.number)} />
              ))}
            </View>
            <View className="w-px bg-gray-200 self-stretch" />
            <View className="flex-row flex-wrap gap-2 w-[88px]">
              {rightSeats.map((seat) => (
                <SeatButton key={seat.number} seat={seat} onSelect={() => onSelectSeat(seat.number)} />
              ))}
            </View>
          </View>
        </View>
      </View>

      {standingSpots.length > 0 && (
        <View className="mt-7 pt-6 border-t border-gray-100">
          <Text className="text-sm font-semibold text-navy-900 mb-0.5">
            Zona de pie – {standingSpots.length * 3} lugares
          </Text>
          <Text className="text-xs text-gray-400 mb-4">
            Asientos ocupados – puedes reservar un lugar de pie
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {standingSpots.map((spot) => {
              const selected = selectedStandingId === spot.id;
              const cls = !spot.available
                ? 'bg-gray-200'
                : selected
                ? 'bg-navy-900 border-2 border-navy-700'
                : 'bg-amber-400';
              return (
                <Pressable
                  key={spot.id}
                  onPress={spot.available ? () => onSelectStanding(spot.id) : undefined}
                  disabled={!spot.available}
                  className={`w-8 h-8 rounded-full ${cls}`}
                />
              );
            })}
          </View>
        </View>
      )}

      <View className="flex-row items-center gap-6 mt-6 pt-5 border-t border-gray-100 flex-wrap">
        <LegendItem color="bg-green-400" label="Disponible" />
        <LegendItem color="bg-red-400" label="Ocupado" />
        <LegendItem color="bg-navy-900" label="Seleccionado" />
        {standingSpots.length > 0 && (
          <LegendItem color="bg-amber-400" label="Lugar de pie disponible" />
        )}
      </View>
    </View>
  );
}
