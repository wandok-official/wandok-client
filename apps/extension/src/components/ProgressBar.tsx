import { useEffect, useRef,useState } from 'react';

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
      className="fixed top-0 right-0 h-screen bg-gray-200 z-[2147483646]"
      style={{ width: PROGRESS_BAR.WIDTH }}
    >
      <div
        className="bg-amber-500 w-full transition-all duration-100 ease-out"
        style={{ height: `${scrollPercent}%` }}
      />
    </div>
  );
};
