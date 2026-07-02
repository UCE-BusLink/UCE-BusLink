import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Bus, Clock } from 'lucide-react-native';

function SummaryRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View>{icon}</View>
      <View className="flex-1">
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text className="text-sm font-semibold text-navy-900">{value}</Text>
      </View>
    </View>
  );
}

interface BookingSummaryProps {
  routeName: string;
  tripTime: string;
  selectionLabel: string | null;
  hasSelection: boolean;
  confirming: boolean;
  onConfirm: () => void;
}

export function BookingSummary({
  routeName,
  tripTime,
  selectionLabel,
  hasSelection,
  confirming,
  onConfirm,
}: BookingSummaryProps) {
  const enabled = hasSelection && !confirming;
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <Text className="text-sm font-semibold text-navy-900 mb-5">Resumen de Reserva</Text>

      <View className="gap-4">
        <SummaryRow icon={<Bus size={14} color="#9ca3af" />} label="Ruta" value={routeName} />
        <SummaryRow icon={<Clock size={14} color="#9ca3af" />} label="Horario" value={`${tripTime} hrs`} />
      </View>

      <View className="mt-5 pt-5 border-t border-gray-100">
        <Text className="text-xs text-gray-400 mb-1">Tu selección</Text>
        {selectionLabel ? (
          <Text className="text-2xl font-bold text-navy-900">{selectionLabel}</Text>
        ) : (
          <Text className="text-sm text-gray-400">Ninguno seleccionado</Text>
        )}
      </View>

      <Pressable
        onPress={enabled ? onConfirm : undefined}
        disabled={!enabled}
        className={`w-full mt-6 py-3 rounded-xl items-center ${enabled ? 'bg-amber-500 active:bg-amber-600' : 'bg-gray-100'}`}
      >
        <Text className={`text-sm font-semibold ${enabled ? 'text-white' : 'text-gray-400'}`}>
          {confirming ? 'Confirmando...' : 'Confirmar reserva →'}
        </Text>
      </Pressable>
    </View>
  );
}
