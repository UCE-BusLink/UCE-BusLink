import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ticket, Clock, QrCode, X, MapPin, User, Bus, Hash } from 'lucide-react-native';
import type { ActiveReservationItem } from '../../types';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' });
}

interface ActiveReservationCardProps {
  item: ActiveReservationItem;
  onViewQr: () => void;
  onCancel: () => void;
  cancelling?: boolean;
}

export function ActiveReservationCard({ item, onViewQr, onCancel, cancelling }: ActiveReservationCardProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const { trip, route } = item;

  const stops = route.stops ?? [];
  const origin = stops[0]?.stopName ?? '—';
  const destination = stops[stops.length - 1]?.stopName ?? '—';

  return (
    <View className="bg-navy-900 rounded-2xl shadow-sm overflow-hidden mb-4">
      <View className="px-6 py-5">
        <View className="flex-row items-start justify-between mb-1">
          <View className="flex-row items-center gap-2">
            <Ticket size={16} color="#fbbf24" />
            <Text className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              Reserva activa
            </Text>
          </View>
          <View className="bg-white/10 px-2.5 py-1 rounded-full">
            <Text className="text-xs text-white/70 capitalize">{formatDate(trip.departureTime)}</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-white mt-1">{route.name}</Text>

        <View className="flex-row items-center gap-1.5 mt-1">
          <MapPin size={12} color="rgba(255,255,255,0.5)" />
          <Text className="text-sm text-white/50" numberOfLines={1}>{origin} → {destination}</Text>
        </View>

        <View className="flex-row items-center gap-6 mt-4">
          <View className="flex-row items-center gap-2">
            <Clock size={14} color="rgba(255,255,255,0.4)" />
            <Text className="text-2xl font-bold text-white">{formatTime(trip.departureTime)}</Text>
          </View>
          <View>
             <View className="flex-row items-center gap-1.5 mb-0.5">
               <User size={12} color="rgba(255,255,255,0.4)" />
               <Text className="text-xs text-white/70" numberOfLines={1}>{item.driverName || 'Conductor'}</Text>
             </View>
             <View className="flex-row items-center gap-3">
               <View className="flex-row items-center gap-1.5">
                 <Bus size={12} color="rgba(255,255,255,0.4)" />
                 <Text className="text-xs text-white/50">{trip.busId || 'Bus N/A'}</Text>
               </View>
               <View className="flex-row items-center gap-1.5">
                 <Hash size={12} color="rgba(255,255,255,0.4)" />
                 <Text className="text-xs text-white/50">Asiento {item.reservation.seatId || 'N/A'}</Text>
               </View>
             </View>
          </View>
        </View>
      </View>

      <View className="bg-white/5 px-6 py-4 border-t border-white/10 flex-row items-center justify-between gap-3">
        <Pressable onPress={onViewQr} className="flex-row items-center gap-1.5">
          <QrCode size={15} color="#fbbf24" />
          <Text className="text-sm font-semibold text-amber-400">Ver QR</Text>
        </Pressable>

        {confirmingCancel ? (
          <View className="flex-row items-center gap-2">
            <Pressable onPress={() => setConfirmingCancel(false)} className="px-3 py-1.5 rounded-lg">
              <Text className="text-xs font-medium text-white/70">Mantener</Text>
            </Pressable>
            <Pressable
              onPress={() => { setConfirmingCancel(false); onCancel(); }}
              disabled={cancelling}
              className={`px-3 py-1.5 rounded-lg bg-red-500 ${cancelling ? 'opacity-50' : ''}`}
            >
              <Text className="text-xs font-semibold text-white">{cancelling ? 'Cancelando...' : 'Confirmar'}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setConfirmingCancel(true)} className="flex-row items-center gap-1.5">
            <X size={15} color="#f87171" />
            <Text className="text-sm font-semibold text-red-400">Cancelar reserva</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
