import { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const useEventListener = (
    eventType = '',
    listener = () => null,
    target = null,
    options = null
  ) => {
    const savedListener = useRef();
  
    useEffect(() => {
      savedListener.current = listener;
    }, [listener]);
  
    useEffect(() => {
      if (!target?.addEventListener) return;
  
      const eventListener = event => savedListener.current(event);
  
      target.addEventListener(eventType, eventListener, options);
  
      return () => {
        target.removeEventListener(eventType, eventListener, options);
      };
    }, [eventType, target, options]);
};

const Dialog = ({ show = false, onClose = () => null }) => {
  const dialogRef = useRef();

  // Event listener to close dialog on click outside element
  useEventListener(
    'mousedown',
    event => {
      if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
      }
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        console.log('Click outside detected -> closing dialog...');
        onClose();
      }
    },
    window
  );

  return show
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 md:p-12 bg-blurred">
          <div
            className="relative bg-white rounded-md shadow-card max-h-full max-w-screen-sm w-full animate-zoom-in px-6 py-20"
            ref={dialogRef}
          >
            <p className="text-center font-semibold text-4xl">
              What's up{' '}
              <span className="text-white bg-red-500 py-1 px-3 rounded-md mr-1">
                YouTube
              </span>
              ?
            </p>
          </div>
        </div>,
        document.body
      )
    : null;
};

export default Dialog;
