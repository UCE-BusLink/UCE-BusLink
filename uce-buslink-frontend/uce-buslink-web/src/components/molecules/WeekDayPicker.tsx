import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      {onWeekChange && (
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={() => onWeekChange(0)}
            disabled={weekOffset === 0}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              weekOffset === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            <ChevronLeft size={16} />
            Esta semana
          </button>
          
          <span className="text-sm font-bold text-gray-700">
            {weekOffset === 0 ? 'Semana Actual' : 'Próxima Semana'}
          </span>

          <button
            onClick={() => onWeekChange(1)}
            disabled={weekOffset === 1}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${
              weekOffset === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-navy-700 hover:text-navy-900'
            }`}
          >
            Próxima semana
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-1">
        {days.map((day, index) => {
          const isDisabled = day.hasTrips === false;
          return (
            <button
              key={index}
              onClick={() => !isDisabled && onSelect(index)}
              disabled={isDisabled}
              className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl transition-colors flex-1 relative min-h-[64px] ${
                isDisabled
                  ? 'text-gray-300 cursor-not-allowed bg-transparent opacity-60'
                  : selectedIndex === index
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-100'
              }`}
            >
              <span className="text-xs font-medium">{day.label}</span>
              <span className="text-sm font-bold mt-0.5">{day.day}</span>
              
              {!isDisabled && (
                <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                  selectedIndex === index ? 'bg-white' : 'bg-emerald-500'
                }`}></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
