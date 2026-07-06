import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CalendarOff, Clock, ShieldCheck, Ticket } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  async function handleCancel(item: ActiveReservationItem) {
    const token = await getToken({ template: 'uce-buslink' });
    if (!token) return;
    setCancellingId(item.reservation.id);
    await cancelReservation(token, item.reservation.id, 'Cancelado por el estudiante')
      .then(() => { 
        queryClient.invalidateQueries({ queryKey: ['activeReservations'] });
        queryClient.invalidateQueries({ queryKey: ['reservationHistory'] });
      })
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

      <View className="flex-row items-center justify-between mb-5 mt-10">
        <Text className="text-sm font-semibold text-navy-900 uppercase tracking-wide">
          Información de Abordaje
        </Text>
      </View>

      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <View className="flex-col gap-6">
          <View className="flex-col items-center text-center">
            <View className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Clock size={24} color="#2563eb" />
            </View>
            <Text className="font-semibold text-navy-900 mb-1">Llega a tiempo</Text>
            <Text className="text-xs text-gray-500 text-center">Asegúrate de estar en tu parada al menos 5 minutos antes de la hora de salida.</Text>
          </View>
          
          <View className="flex-col items-center text-center">
            <View className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
              <Ticket size={24} color="#d97706" />
            </View>
            <Text className="font-semibold text-navy-900 mb-1">Ten tu QR listo</Text>
            <Text className="text-xs text-gray-500 text-center">Abre tu código QR antes de subir a la unidad para agilizar el abordaje de todos.</Text>
          </View>
          
          <View className="flex-col items-center text-center">
            <View className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck size={24} color="#059669" />
            </View>
            <Text className="font-semibold text-navy-900 mb-1">Respeta tu asiento</Text>
            <Text className="text-xs text-gray-500 text-center">Cada boleto tiene un asiento asignado. Por favor ocupa únicamente el tuyo.</Text>
          </View>
        </View>
        
        <View className="mt-8 pt-6 border-t border-gray-100 items-center">
          <Pressable
            onPress={() => navigation.navigate('Main', { screen: 'Routes' })}
            className="px-6 py-3 bg-navy-900 rounded-xl active:bg-navy-800"
          >
            <Text className="text-white text-sm font-medium">Explorar y reservar nuevas rutas</Text>
          </Pressable>
        </View>
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
