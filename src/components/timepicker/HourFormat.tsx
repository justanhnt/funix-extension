import React, { useEffect, useState, useRef } from 'react';
import { initialNumbersValue, returnSelectedValue } from '../../helpers';
import PickerEffects from './PickerEffect';

interface HourFormatProps {
   height: number;
   value: string;
   setValue: (value: string) => void;
   onAmPmChange: (value: string) => void;
   setHourFormat: (format: { mount: boolean; hourFormat: string }) => void;
   hourFormat: { mount: boolean; hourFormat: string };
}

interface HourItem {
   number: string;
   translatedValue: string;
   selected: boolean;
}

function HourFormat({ height, value, setValue, onAmPmChange, setHourFormat, hourFormat }: HourFormatProps) {
   const Hours: HourItem[] = [
      {
         number: 'AM',
         translatedValue: (height * 2).toString(),
         selected: false,
      },
      {
         number: 'PM',
         translatedValue: height.toString(),
         selected: false,
      },
   ];

   const [hours, setHours] = useState<HourItem[]>([
      {
         number: 'AM',
         translatedValue: (height * 2).toString(),
         selected: hourFormat.hourFormat === 'AM',
      },
      {
         number: 'PM',
         translatedValue: height.toString(),
         selected: hourFormat.hourFormat === 'PM',
      },
   ]);
   const mainListRef = useRef<HTMLDivElement>(null);
   const [cursorPosition, setCursorPosition] = useState<number>(0);
   const [firstCursorPosition, setFirstCursorPosition] = useState<number | null>(null);
   const [currentTranslatedValue, setCurrentTranslatedValue] = useState<number>(
      parseInt(hours.filter((item) => item.selected === true)[0].translatedValue),
   );
   const [startCapture, setStartCapture] = useState<boolean>(false);
   const [showFinalTranslate, setShowFinalTranslate] = useState<boolean>(false);
   // start and end times
   const [dragStartTime, setDragStartTime] = useState<number | null>(null);
   const [dragEndTime, setDragEndTime] = useState<number | null>(null);
   // drag duration
   const [dragDuration, setDragDuration] = useState<number | null>(null);
   // drag type fast or slow
   const [dragType, setDragType] = useState<'fast' | 'slow' | null>(null);
   // drag direction
   const [dragDirection, setDragDirection] = useState<'up' | 'down' | null>(null);
   // selected number
   const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      setShowFinalTranslate(false);
      setFirstCursorPosition(e.clientY);
      setStartCapture(true);
      setDragStartTime(performance.now());
   };

   const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      setShowFinalTranslate(false);
      setFirstCursorPosition(e.targetTouches[0].clientY);
      setStartCapture(true);
      setDragStartTime(performance.now());
   };

   const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
      setStartCapture(false);
      setCurrentTranslatedValue((prev) => prev + cursorPosition);
      setShowFinalTranslate(true);
      setDragEndTime(performance.now());
      if (dragStartTime && performance.now() - dragStartTime <= 100) {
         setDragType('fast');
      } else {
         setDragType('slow');
      }
      if (cursorPosition < 0) {
         setDragDirection('down');
      } else {
         setDragDirection('up');
      }
   };

   const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      setStartCapture(false);
      setCurrentTranslatedValue((prev) => prev + cursorPosition);
      setShowFinalTranslate(true);
      setDragEndTime(performance.now());
      if (dragStartTime && performance.now() - dragStartTime <= 100) {
         setDragType('fast');
      } else {
         setDragType('slow');
      }
      if (cursorPosition < 0) {
         setDragDirection('down');
      } else {
         setDragDirection('up');
      }
   };

   const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      setStartCapture(false);
      setCurrentTranslatedValue((prev) => prev + cursorPosition);
      setShowFinalTranslate(true);
      setDragEndTime(performance.now());

      if (cursorPosition < 0) {
         setDragDirection('down');
      } else {
         setDragDirection('up');
      }
   };

   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (startCapture && firstCursorPosition !== null) {
         setCursorPosition(e.clientY - firstCursorPosition);
      } else {
         setCursorPosition(0);
      }
   };

   const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      if (startCapture && firstCursorPosition !== null) {
         setCursorPosition(e.targetTouches[0].clientY - firstCursorPosition);
      } else {
         setCursorPosition(0);
      }
   };

   // preview translation
   useEffect(() => {
      if (startCapture && mainListRef.current) {
         mainListRef.current.style.transform = `translateY(${
            currentTranslatedValue + cursorPosition
         }px)`;
      }
   }, [cursorPosition, startCapture, currentTranslatedValue]);

   // final translation here
   useEffect(() => {
      if (showFinalTranslate && mainListRef.current && dragEndTime && dragStartTime) {
         setDragDuration(dragEndTime - dragStartTime);

         let finalValue = Math.round(currentTranslatedValue / height) * height;
         if (finalValue < height) finalValue = height;
         if (finalValue > height * 2) finalValue = height * 2;
         mainListRef.current.style.transform = `translateY(${finalValue}px)`;
         setCurrentTranslatedValue(finalValue);
         setCursorPosition(0);
      }
   }, [showFinalTranslate, dragEndTime, dragStartTime, currentTranslatedValue, height]);

   // return to default position after drag end (handleTransitionEnd)
   const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName === 'transform') {
         const selectedValueArray = [
            {
               number: 'AM',
               translatedValue: (height * 2).toString(),
               arrayNumber: 0,
            },
            {
               number: 'PM',
               translatedValue: height.toString(),
               arrayNumber: 1,
            },
         ];
         selectedValueArray.forEach((item) => {
            if (parseInt(item.translatedValue) === currentTranslatedValue) {
               setSelectedNumber(item.arrayNumber);
               setHourFormat({ mount: true, hourFormat: item.number });
               setHours(() => {
                  const newValue = Hours.map((hour) => {
                     if (
                        hour.number === item.number &&
                        hour.translatedValue === currentTranslatedValue.toString()
                     ) {
                        return {
                           ...hour,
                           selected: true,
                        };
                     }
                     return hour;
                  });
                  return newValue;
               });
            }
         });
      }
   };

   // handle click to select number
   const handleClickToSelect = (e: React.MouseEvent<HTMLDivElement>) => {
      if (cursorPosition === 0) {
         const target = e.target as HTMLDivElement;
         setCurrentTranslatedValue(parseInt(target.dataset.translatedValue || '0'));
      }
   };

   /** ***************************   handle wheel scroll ************************* */

   const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.deltaY > 0) {
         if (currentTranslatedValue <= height) {
            setCurrentTranslatedValue((prev) => prev + height);
         }
      } else if (currentTranslatedValue >= height * 2) {
         setCurrentTranslatedValue((prev) => prev - height);
      }
   };

   return (
      <div
         className="ios-timepicker-react-hour-format"
         onMouseDown={handleMouseDown}
         onMouseUp={handleMouseUp}
         onMouseMove={handleMouseMove}
         onMouseLeave={handleMouseLeave}
         style={{ height: height * 5 }}
         onWheel={handleWheelScroll}
         onTouchStart={handleTouchStart}
         onTouchMove={handleTouchMove}
         onTouchEnd={handleTouchEnd}
      >
         {/* <PickerEffects height={height} /> */}
         <div
            ref={mainListRef}
            className={`${showFinalTranslate && 'ios-timepicker-react-hour-format-transition'}`}
            onTransitionEnd={handleTransitionEnd}
            style={{ transform: `translateY(${currentTranslatedValue}px)` }}
         >
            {hours.map((hourObj, index) => (
               <div
                  key={index}
                  className="ios-timepicker-react-cell-hour"
                  style={{ height: `${height}px` }}
               >
                  <div
                     className={`ios-timepicker-react-cell-inner-hour-format${
                        hourObj.selected
                           ? ' ios-timepicker-react-cell-inner-hour-format-selected'
                           : ''
                     }`}
                     onClick={handleClickToSelect}
                     data-translated-value={hourObj.translatedValue}
                  >
                     {hourObj.number}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

export default HourFormat;