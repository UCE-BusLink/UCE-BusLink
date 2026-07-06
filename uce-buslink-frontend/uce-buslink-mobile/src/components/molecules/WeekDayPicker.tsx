import { View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import type { WeekDay } from '../../types';

interface WeekDayPickerProps {
  days: WeekDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  weekOffset?: number;
  onWeekChange?: (offset: number) => void;
}

export function WeekDayPicker({ days, selectedIndex, onSelect, weekOffset = 0, onWeekChange }: WeekDayPickerProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      {onWeekChange && (
        <View className="flex-row items-center justify-between mb-4 px-2">
          <Pressable
            onPress={() => onWeekChange(0)}
            disabled={weekOffset === 0}
            className={`flex-row items-center gap-1 ${weekOffset === 0 ? 'opacity-50' : 'opacity-100'}`}
          >
            <ChevronLeft size={16} color={weekOffset === 0 ? '#d1d5db' : '#374151'} />
            <Text className={`text-sm font-medium ${weekOffset === 0 ? 'text-gray-300' : 'text-navy-700'}`}>
              Esta semana
            </Text>
          </Pressable>
          
          <Text className="text-sm font-bold text-gray-700">
            {weekOffset === 0 ? 'Semana Actual' : 'Próxima Semana'}
          </Text>

          <Pressable
            onPress={() => onWeekChange(1)}
            disabled={weekOffset === 1}
            className={`flex-row items-center gap-1 ${weekOffset === 1 ? 'opacity-50' : 'opacity-100'}`}
          >
            <Text className={`text-sm font-medium ${weekOffset === 1 ? 'text-gray-300' : 'text-navy-700'}`}>
              Próxima semana
            </Text>
            <ChevronRight size={16} color={weekOffset === 1 ? '#d1d5db' : '#374151'} />
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center gap-1">
        {days.map((day, index) => {
          const isDisabled = day.hasTrips === false;
          const active = selectedIndex === index;
          return (
            <Pressable
              key={index}
              onPress={() => !isDisabled && onSelect(index)}
              disabled={isDisabled}
              className={`flex-col items-center justify-center px-2 py-2.5 rounded-xl flex-1 relative min-h-[64px] ${
                isDisabled
                  ? 'bg-transparent opacity-50 border border-transparent'
                  : active
                  ? 'bg-navy-900 border border-navy-900 shadow-sm'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <Text className={`text-xs font-medium ${isDisabled ? 'text-gray-400' : active ? 'text-white' : 'text-gray-600'}`}>{day.label}</Text>
              <Text className={`text-sm font-bold mt-0.5 ${isDisabled ? 'text-gray-400' : active ? 'text-white' : 'text-gray-800'}`}>{day.day}</Text>
              
              {!isDisabled && (
                <View className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                  active ? 'bg-white' : 'bg-emerald-500'
                }`} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
