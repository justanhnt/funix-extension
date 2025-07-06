import React, { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, addWeeks } from 'date-fns';

interface CalendarProps {
  onDateSelect: (dates: Date[]) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isNextWeek, setIsNextWeek] = useState(false);
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
  const currentWeekStart = isNextWeek ? addWeeks(weekStart, 1) : weekStart;

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handleDateClick = (date: Date) => {
    const newSelectedDates = selectedDates.some(d => isSameDay(d, date))
      ? selectedDates.filter(d => !isSameDay(d, date))
      : [...selectedDates, date];
    
    setSelectedDates(newSelectedDates);
    onDateSelect(newSelectedDates);
  };

  const toggleWeek = () => {
    setIsNextWeek(!isNextWeek);
    // Clear selected dates when switching weeks
    setSelectedDates([]);
    onDateSelect([]);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">
          {isNextWeek ? 'Next Week' : 'Current Week'}
        </h3>
        <button
          onClick={toggleWeek}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Switch to {isNextWeek ? 'Current' : 'Next'} Week
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => handleDateClick(date)}
            className={`p-2 rounded-lg text-center ${
              selectedDates.some(d => isSameDay(d, date))
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="font-semibold">{format(date, 'EEE')}</div>
            <div>{format(date, 'd')}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 