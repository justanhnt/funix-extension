import React, { useState, useEffect } from 'react';
import TimePicker from './timepicker/TimePicker';
import { format } from 'date-fns';

interface TimeSlotSelectorProps {
  selectedDates: Date[];
  mentorId: number;
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ selectedDates, mentorId, startTime, endTime, onStartTimeChange, onEndTimeChange }) => {
  const [isContentScriptReady, setIsContentScriptReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if content script is ready
  useEffect(() => {
    const checkContentScript = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) return;
        const response = await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
        setIsContentScriptReady(response?.success || false);
      } catch (error) {
        setIsContentScriptReady(false);
      }
    };
    checkContentScript();
    const interval = setInterval(checkContentScript, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!isContentScriptReady) {
      setError('Please wait for the extension to initialize...');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        throw new Error('No active tab found');
      }
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'CREATE_TIME_SLOTS',
        payload: {
          selectedDates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
          startTime: startTime.length === 5 ? startTime + ':00' : startTime, // ensure HH:mm:ss
          endTime: endTime.length === 5 ? endTime + ':00' : endTime,
          mentorId
        }
      });
      if (response.success) {
        console.log('All slots created successfully:', response.results);
      } else {
        setError(response.error || 'Failed to create time slots');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error communicating with content script: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!isContentScriptReady && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg">
          Initializing extension...
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-4 text-center">Select Time Range (Local Time)</h3>
        <div className="flex flex-row gap-2 justify-center">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
            <TimePicker
              onChange={onStartTimeChange}
              value={startTime}
              hours={24}
              minutesInterval={1}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
            <TimePicker
              onChange={onEndTimeChange}
              value={endTime}
              hours={24}
              minutesInterval={1}
            />
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Selected: <span className="font-semibold text-blue-700">{startTime}</span> to <span className="font-semibold text-blue-700">{endTime}</span>
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={selectedDates.length === 0 || !isContentScriptReady || isLoading}
        className={`mt-4 w-full py-2 rounded-lg text-lg font-semibold transition-colors duration-150
          ${selectedDates.length === 0 || !isContentScriptReady || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}
        `}
      >
        {isLoading ? 'Scheduling...' : `Schedule ${selectedDates.length} Session${selectedDates.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
};

export default TimeSlotSelector; 