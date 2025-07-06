import React, { useEffect, useState, useRef } from 'react';
import { initialNumbersValue, returnSelectedValue } from '../../helpers';
import PickerEffects from './PickerEffect';

interface HourWheelProps {
   height: number;
   value: string;
   setValue: (value: string) => void;
   use12Hours: boolean;
}

interface HourItem {
   number: string;
   translatedValue: string;
   selected: boolean;
   hidden?: boolean;
}

function HourWheel({ height, value, setValue, use12Hours }: HourWheelProps) {
   const hourLength = use12Hours ? 13 : 24;
   const [hours, setHours] = useState<HourItem[]>(
      initialNumbersValue(height, hourLength, parseInt(value.slice(0, 2))),
   );
   const mainListRef = useRef<HTMLDivElement>(null);
   const [cursorPosition, setCursorPosition] = useState<number>(0);
   const [firstCursorPosition, setFirstCursorPosition] = useState<number | null>(null);
   const [currentTranslatedValue, setCurrentTranslatedValue] = useState<number>(
      parseInt(
         initialNumbersValue(height, hourLength, parseInt(value.slice(0, 2))).filter(
            (item) => item.number === value.slice(0, 2) && item.selected === true,
         )[0].translatedValue,
      ),
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
         if (dragEndTime - dragStartTime <= 100 && cursorPosition !== 0) {
            let currentValue: number;
            if (dragDirection === 'down') {
               currentValue = currentTranslatedValue - (120 / (dragEndTime - dragStartTime)) * 100;
            } else if (dragDirection === 'up') {
               currentValue = currentTranslatedValue + (120 / (dragEndTime - dragStartTime)) * 100;
            } else {
               currentValue = currentTranslatedValue;
            }
            let finalValue = Math.round(currentValue / height) * height;
            if (use12Hours) {
               if (finalValue < height * -34) finalValue = height * -34;
               if (finalValue > height) finalValue = height;
            } else {
               if (finalValue < height * -69) finalValue = height * -69;
               if (finalValue > height * 2) finalValue = height * 2;
            }

            mainListRef.current.style.transform = `translateY(${finalValue}px)`;
            setCurrentTranslatedValue(finalValue);
         }
         if (dragEndTime - dragStartTime > 100 && cursorPosition !== 0) {
            let finalValue = Math.round(currentTranslatedValue / height) * height;
            if (use12Hours) {
               if (finalValue < height * -34) finalValue = height * -34;
               if (finalValue > height) finalValue = height;
            } else {
               if (finalValue < height * -69) finalValue = height * -69;
               if (finalValue > height * 2) finalValue = height * 2;
            }
            mainListRef.current.style.transform = `translateY(${finalValue}px)`;
            setCurrentTranslatedValue(finalValue);
         }
         setCursorPosition(0);
      }
   }, [showFinalTranslate, dragEndTime, dragStartTime, currentTranslatedValue, height, cursorPosition, dragDirection, use12Hours]);

   // return to default position after drag end (handleTransitionEnd)
   const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName === 'transform') {
         returnSelectedValue(height, hourLength).forEach((item) => {
            if (parseInt(item.translatedValue) === currentTranslatedValue) {
               setSelectedNumber(item.arrayNumber || null);
               setValue(`${item.number}:${value.slice(3, 6)}`);
               setHours(() => {
                  const newValue = initialNumbersValue(height, hourLength).map((hour) => {
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

   const isFastCondition = showFinalTranslate && dragType === 'fast';
   const isSlowCondition = showFinalTranslate && dragType === 'slow';

   /** ***************************   handle wheel scroll ************************* */

   const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
      if (use12Hours) {
         if (e.deltaY > 0) {
            if (currentTranslatedValue < height) {
               setCurrentTranslatedValue((prev) => prev + height);
            }
         } else if (currentTranslatedValue > height * -34) {
            setCurrentTranslatedValue((prev) => prev - height);
         }
      } else if (e.deltaY > 0) {
         if (currentTranslatedValue < height * 2) {
            setCurrentTranslatedValue((prev) => prev + height);
         }
      } else if (currentTranslatedValue > height * -69) {
         setCurrentTranslatedValue((prev) => prev - height);
      }
   };

   return (
      <div
         className={`ios-timepicker-react-hour ${
            use12Hours && 'ios-timepicker-react-hour-12hour-format'
         }`}
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
            className={`${isFastCondition === true && 'ios-timepicker-react-fast'} ${
               isSlowCondition === true && 'ios-timepicker-react-slow'
            }`}
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
                     className={`ios-timepicker-react-cell-inner-hour${
                        hourObj.selected ? ' ios-timepicker-react-cell-inner-selected' : ''
                     }${hourObj.hidden ? ' ios-timepicker-react-cell-inner-hidden' : ''}`}
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

export default HourWheel;