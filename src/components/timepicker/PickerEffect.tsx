import React from 'react';

function PickerEffects({ height }: { height: number }) {
   return (
      <>
         <div className="ios-timepicker-react-top-shadow" style={{ height: `${height * 2}px` }} />
         <div
            className="ios-timepicker-react-bottom-shadow"
            style={{ height: `${height * 2}px` }}
         />
      </>
   );
}

export default PickerEffects;