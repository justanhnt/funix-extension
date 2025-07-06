import React, { useEffect, useState } from 'react';
import HourFormat from './HourFormat';
import HourWheel from './HourWheel';
import MinuteWheel from './MinuteWheel';

interface TimePickerSelectionProps {
   pickerDefaultValue: string;
   initialValue: string;
   onChange: (value: string) => void;
   height: number;
   onSave: (value: string) => void;
   onCancel: () => void;
   cancelButtonText: string;
   saveButtonText: string;
   controllers: boolean;
   setInputValue: (value: string) => void;
   setIsOpen: (isOpen: boolean) => void;
   seperator: boolean;
   use12Hours: boolean;
   onAmPmChange: (value: string) => void;
}

function TimePickerSelection({
   pickerDefaultValue,
   initialValue,
   onChange,
   height,
   onSave,
   onCancel,
   cancelButtonText,
   saveButtonText,
   controllers,
   setInputValue,
   setIsOpen,
   seperator,
   use12Hours,
   onAmPmChange,
}: TimePickerSelectionProps) {
   // Parse initial value to get time and AM/PM format
   const getInitialTimeValue = () => {
      if (!initialValue) return pickerDefaultValue;
      
      if (use12Hours) {
         // For 12-hour format, extract time part (HH:MM) and AM/PM
         const timeMatch = initialValue.match(/^(\d{1,2}:\d{2})\s*(AM|PM)$/i);
         if (timeMatch) {
            return timeMatch[1]; // Return HH:MM part
         }
         return initialValue.slice(0, 5); // Fallback: take first 5 characters
      }
      
      return initialValue;
   };

   const getInitialHourFormat = () => {
      if (!initialValue || !use12Hours) return 'AM';
      
      const ampmMatch = initialValue.match(/\s*(AM|PM)$/i);
      return ampmMatch ? ampmMatch[1].toUpperCase() : 'AM';
   };

   const [value, setValue] = useState(getInitialTimeValue());
   const [hourFormat, setHourFormat] = useState({
      mount: false,
      hourFormat: getInitialHourFormat(),
   });

   // Update internal state when initialValue changes
   useEffect(() => {
      const newTimeValue = getInitialTimeValue();
      const newHourFormat = getInitialHourFormat();
      
      setValue(newTimeValue);
      setHourFormat({
         mount: true,
         hourFormat: newHourFormat,
      });
   }, [initialValue, use12Hours]);

   // Handle real-time updates when controllers are disabled
   useEffect(() => {
      if (!controllers) {
         const finalSelectedValue = use12Hours ? `${value} ${hourFormat.hourFormat}` : value;
         setInputValue(finalSelectedValue);
         onChange(finalSelectedValue);
      }
   }, [value, hourFormat.hourFormat, controllers, use12Hours, setInputValue, onChange]);

   // Handle AM/PM changes
   useEffect(() => {
      if (hourFormat.mount) {
         onAmPmChange(hourFormat.hourFormat);
      }
   }, [hourFormat, onAmPmChange]);

   const params = {
      height,
      value,
      setValue,
      controllers,
      use12Hours,
      onAmPmChange,
      setHourFormat,
      hourFormat,
   };

   const handleSave = () => {
      const finalSelectedValue = use12Hours ? `${value} ${hourFormat.hourFormat}` : value;
      setInputValue(finalSelectedValue);
      onChange(finalSelectedValue);
      onSave(finalSelectedValue);
      setIsOpen(false);
   };

   const handleCancel = () => {
      onCancel();
      setIsOpen(false);
   };

   return (
      <div className="ios-timepicker-react  ios-timepicker-react-transition">
         {controllers && (
            <div className="ios-timepicker-react-btn-container">
               <button
                  className="ios-timepicker-react-btn ios-timepicker-react-btn-cancel"
                  onClick={handleCancel}
               >
                  {cancelButtonText}
               </button>
               <button className="ios-timepicker-react-btn" onClick={handleSave}>
                  {saveButtonText}
               </button>
            </div>
         )}
         <div className="ios-timepicker-react-container" style={{ height: `${height * 5 + 40}px` }}>
            <div
               className="ios-timepicker-react-selected-overlay"
               style={{
                  top: `${height * 2 + 20}px`,
                  height: `${height}px`,
               }}
            />
            <HourWheel {...params} />
            {seperator && <div className="ios-timepicker-react-colon">:</div>}
            <MinuteWheel {...params} />
            {use12Hours && <HourFormat {...params} />}
         </div>
      </div>
   );
}

export default TimePickerSelection;