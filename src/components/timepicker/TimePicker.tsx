import React, { useEffect, useState } from 'react';
import TimePickerSelection from './TimePickerSelection';
import './timepicker.css';

interface TimePickerProps {
   value?: string | null;
   cellHeight?: number;
   placeHolder?: string;
   pickerDefaultValue?: string;
   onChange?: (value: string) => void;
   onFocus?: () => void;
   onSave?: (value: string) => void;
   onCancel?: () => void;
   disabled?: boolean;
   isOpen?: boolean;
   required?: boolean;
   cancelButtonText?: string;
   saveButtonText?: string;
   controllers?: boolean;
   seperator?: boolean;
   id?: string | null;
   use12Hours?: boolean;
   onAmPmChange?: (value: string) => void;
   name?: string | null;
   onOpen?: () => void;
   popupClassName?: string | null;
   inputClassName?: string | null;
   hours?: number;
   minutesInterval?: number;
}

function TimePicker({
   value: initialValue = null,
   cellHeight = 28,
   placeHolder = 'Select Time',
   pickerDefaultValue = '10:00',
   onChange = () => {},
   onFocus = () => {},
   onSave = () => {},
   onCancel = () => {},
   disabled = false,
   isOpen: initialIsOpenValue = false,
   required = false,
   cancelButtonText = 'Cancel',
   saveButtonText = 'Save',
   controllers = true,
   seperator = true,
   id = null,
   use12Hours = false,
   onAmPmChange = () => {},
   name = null,
   onOpen = () => {},
   popupClassName = null,
   inputClassName = null,
}: TimePickerProps) {
   const [isOpen, setIsOpen] = useState(initialIsOpenValue);
   const [height, setHeight] = useState(cellHeight);
   const [inputValue, setInputValue] = useState<string>('');

   // Initialize input value based on initialValue or pickerDefaultValue
   useEffect(() => {
      if (initialValue !== null) {
         setInputValue(initialValue);
      } else if (use12Hours) {
         setInputValue(`${pickerDefaultValue} AM`);
      } else {
         setInputValue(pickerDefaultValue);
      }
   }, [initialValue, pickerDefaultValue, use12Hours]);

   // Update input value when initialValue prop changes
   useEffect(() => {
      if (initialValue !== null) {
         setInputValue(initialValue);
      }
   }, [initialValue]);

   const handleClick = () => {
      if (!disabled) {
         setIsOpen(!isOpen);
      }
   };

   const handleFocus = () => {
      if (!disabled) {
         onFocus();
         onOpen();
         setIsOpen(true);
      }
   };

   const handleSave = (value: string) => {
      setInputValue(value);
      onChange(value);
      onSave(value);
      setIsOpen(false);
   };

   const handleCancel = () => {
      onCancel();
      setIsOpen(false);
   };

   const handleInputValueChange = (value: string) => {
      setInputValue(value);
      onChange(value);
   };

   const params = {
      onChange: handleInputValueChange,
      height,
      onSave: handleSave,
      onCancel: handleCancel,
      cancelButtonText,
      saveButtonText,
      controllers,
      setInputValue: handleInputValueChange,
      setIsOpen,
      seperator,
      use12Hours,
      onAmPmChange,
      initialValue: inputValue,
      pickerDefaultValue,
   };

   return (
      <>
         <div className="ios-timepicker-react-main" onClick={handleClick}>
            <input
               id={id || undefined}
               name={name || undefined}
               className={`ios-timepicker-react-input ${inputClassName || ''}`}
               value={inputValue}
               type="text"
               placeholder={placeHolder}
               readOnly
               disabled={disabled}
               required={required}
               onFocus={handleFocus}
            />
         </div>
         {isOpen && !disabled && (
            <div className="ios-timepicker-react-popup">
               <div
                  className={`ios-timepicker-react-popup-overlay ${popupClassName || ''}`}
                  onClick={() => setIsOpen(false)}
               />
               <TimePickerSelection {...params} />
            </div>
         )}
      </>
   );
}

export default TimePicker;