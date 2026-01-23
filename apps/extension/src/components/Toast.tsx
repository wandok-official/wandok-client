import { useEffect } from 'react';
import { POPOVER } from '../config/constants';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      className="fixed bottom-5 left-1/2 -translate-x-1/2 
                 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg
                 animate-fade-in z-max"
      style={{ zIndex: POPOVER.Z_INDEX }}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
};
