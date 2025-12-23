import { useState, useEffect, useRef } from 'react';
import { PROGRESS_BAR } from '../config/constants';
import { getScrollPercentage } from '../utils/getScrollPercentage';

export const ProgressBar = () => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        return;
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const percent = getScrollPercentage();
        setScrollPercent(percent);
        rafIdRef.current = null;
      });
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      className="h-screen bg-gray-300 flex items-start relative"
      style={{ width: PROGRESS_BAR.WIDTH }}
    >
      <div
        className="w-full bg-amber-500"
        style={{ height: `${scrollPercent}%` }}
      />
    </div>
  );
};
