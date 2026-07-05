import type { WeekDay } from '../../types';

interface WeekDayPickerProps {
  days: WeekDay[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function WeekDayPicker({ days, selectedIndex, onSelect }: WeekDayPickerProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <div className="flex items-center gap-1">
        {days.map((day, index) => {
          const isDisabled = day.hasTrips === false;
          return (
            <button
              key={index}
              onClick={() => !isDisabled && onSelect(index)}
              disabled={isDisabled}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl transition-colors flex-1 ${
                isDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-transparent'
                  : selectedIndex === index
                  ? 'bg-navy-900 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-xs font-medium">{day.label}</span>
              <span className="text-sm font-bold mt-0.5">{day.day}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
