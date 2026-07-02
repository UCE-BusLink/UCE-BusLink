import { View, Text, Pressable } from 'react-native';
import type { WeekDay } from '../../types';

interface WeekDayPickerProps {
  days: WeekDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function WeekDayPicker({ days, selectedIndex, onSelect }: WeekDayPickerProps) {
  return (
    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <View className="flex-row items-center gap-1">
        {days.map((day, index) => {
          const active = selectedIndex === index;
          return (
            <Pressable
              key={index}
              onPress={() => onSelect(index)}
              className={`flex-col items-center px-4 py-2.5 rounded-xl flex-1 ${active ? 'bg-navy-900' : ''}`}
            >
              <Text className={`text-xs font-medium ${active ? 'text-white' : 'text-gray-500'}`}>{day.label}</Text>
              <Text className={`text-sm font-bold mt-0.5 ${active ? 'text-white' : 'text-gray-500'}`}>{day.day}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
