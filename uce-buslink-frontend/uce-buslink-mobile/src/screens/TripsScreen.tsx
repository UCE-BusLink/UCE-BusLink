import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarOff } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useActiveReservations } from '../hooks/useActiveReservations';
import { useReservationHistory } from '../hooks/useReservationHistory';
import { ActiveReservationCard, QrModal, ReservationHistoryCard } from '../components/molecules';
import { Spinner } from '../components/atoms';
import { cancelReservation } from '../services/reservationService';
import type { ActiveReservationItem } from '../types';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';

export function TripsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getToken } = useAuth();
  const { items, loading, error, refetch } = useActiveReservations();

  const { items: historyItems, loading: historyLoading, page, setPage, totalPages, refetch: refetchHistory } = useReservationHistory(5);

  const [qrItem, setQrItem] = useState<ActiveReservationItem | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleCancel(item: ActiveReservationItem) {
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setCancellingId(item.reservation.id);
    await cancelReservation(token, item.reservation.id, 'Cancelado por el estudiante')
      .then(() => { refetch(); refetchHistory(); })
      .catch(() => undefined)
      .finally(() => setCancellingId(null));
  }

  return (
    <ScreenContainer>
      <View className="mb-7">
        <Text className="text-2xl font-bold text-navy-900">Viajes</Text>
        <Text className="text-gray-500 text-sm mt-1">
          Gestiona tus reservas activas y elige tu próximo viaje.
        </Text>
      </View>

      {loading ? (
        <View className="items-center py-12"><Spinner /></View>
      ) : error ? (
        <Text className="text-sm text-red-400 mb-6">{error}</Text>
      ) : items.length === 0 ? (
        <View className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 items-center mb-8">
          <View className="w-14 h-14 bg-gray-100 rounded-full items-center justify-center mb-3">
            <CalendarOff size={24} color="#9ca3af" />
          </View>
          <Text className="font-semibold text-gray-500 mb-1">No tienes reservas activas</Text>
          <Text className="text-sm text-gray-400">Elige un viaje disponible para reservar tu lugar.</Text>
        </View>
      ) : (
        <View className="mb-8">
          {items.map((item) => (
            <ActiveReservationCard
              key={item.reservation.id}
              item={item}
              onViewQr={() => setQrItem(item)}
              onCancel={() => handleCancel(item)}
              cancelling={cancellingId === item.reservation.id}
            />
          ))}
        </View>
      )}

      <View className="mb-8">
        <Text className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-4">Historial</Text>

        {historyLoading ? (
          <View className="items-center py-6"><Spinner /></View>
        ) : historyItems.length === 0 ? (
          <View className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 items-center">
            <Text className="text-sm text-gray-400">No hay reservas anteriores.</Text>
          </View>
        ) : (
          <>
            {historyItems.map((item) => (
              <ReservationHistoryCard key={item.id} item={item} />
            ))}
            {totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-3 mt-2">
                <Pressable onPress={() => setPage((p) => p - 1)} disabled={page === 0}>
                  <Text className={`text-xs font-medium text-navy-900 ${page === 0 ? 'opacity-30' : ''}`}>Anterior</Text>
                </Pressable>
                <Text className="text-xs text-gray-400">{page + 1} / {totalPages}</Text>
                <Pressable onPress={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                  <Text className={`text-xs font-medium text-navy-900 ${page >= totalPages - 1 ? 'opacity-30' : ''}`}>Siguiente</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>

      <Text className="text-sm font-semibold text-navy-900 uppercase tracking-wide mb-5">Viajes disponibles</Text>

      <View className="items-center py-20">
        <CalendarOff size={40} color="#d1d5db" />
        <Text className="text-sm font-medium text-gray-500 mb-1 mt-3">Explora rutas para reservar</Text>
        <Pressable onPress={() => navigation.navigate('Main', { screen: 'Routes' })} className="mt-2">
          <Text className="text-sm font-semibold text-navy-900">Ver rutas disponibles</Text>
        </Pressable>
      </View>

      {qrItem && (
        <QrModal
          qrCode={qrItem.reservation.id}
          title={qrItem.route.name}
          subtitle={new Date(qrItem.trip.departureTime).toLocaleString('es-EC', {
            weekday: 'short', day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit', hour12: false,
          })}
          onClose={() => setQrItem(null)}
        />
      )}
    </ScreenContainer>
  );
}
