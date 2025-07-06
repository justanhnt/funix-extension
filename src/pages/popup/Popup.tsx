import React, { useState, useEffect } from 'react';
import Calendar from '@src/components/Calendar';
import TimeSlotSelector from '@src/components/TimeSlotSelector';
import logo from '@assets/img/logo.svg';

// Custom hook for dynamic height calculation
const useDynamicHeight = () => {
  useEffect(() => {
    const updateHeight = () => {
      const body = document.body;
      const html = document.documentElement;
      const height = Math.max(
        body.scrollHeight, 
        body.offsetHeight,
        html.clientHeight, 
        html.scrollHeight, 
        html.offsetHeight
      );
      document.body.style.height = height + 'px';
    };

    // Update height when component mounts
    updateHeight();

    // Update height when window resizes
    window.addEventListener('resize', updateHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);
};

export default function Popup() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [mentorId, setMentorId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');

  // Use the dynamic height hook
  useDynamicHeight();

  // Load saved data from storage on component mount
  useEffect(() => {
    chrome.storage.local.get(['mentorId', 'startTime', 'endTime'], (result) => {
      if (result.mentorId) {
        setMentorId(result.mentorId);
      }
      if (result.startTime) {
        setStartTime(result.startTime);
      }
      if (result.endTime) {
        setEndTime(result.endTime);
      }
    });
  }, []);

  // Save mentor ID to storage when it changes
  const handleMentorIdChange = (value: string) => {
    setMentorId(value);
    chrome.storage.local.set({ mentorId: value });
  };

  // Save start time to storage when it changes
  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    chrome.storage.local.set({ startTime: value });
  };

  // Save end time to storage when it changes
  const handleEndTimeChange = (value: string) => {
    setEndTime(value);
    chrome.storage.local.set({ endTime: value });
  };

  const handleDateSelect = (dates: Date[]) => {
    setSelectedDates(dates);
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Mentor ID Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mentor ID
          </label>
          <input
            type="number"
            value={mentorId}
            onChange={(e) => handleMentorIdChange(e.target.value)}
            placeholder="Enter mentor ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be remembered for future use
          </p>
        </div>

        <Calendar onDateSelect={handleDateSelect} />
        {selectedDates.length > 0 && mentorId && (
          <TimeSlotSelector 
            selectedDates={selectedDates} 
            mentorId={parseInt(mentorId)}
            startTime={startTime}
            endTime={endTime}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
          />
        )}
        {selectedDates.length > 0 && !mentorId && (
          <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
            Please enter a Mentor ID to continue
          </div>
        )}
      </div>
    </div>
  );
}
