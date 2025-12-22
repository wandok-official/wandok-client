import { useState, useEffect } from 'react';
import { PROGRESS_BAR } from '../config/constants';
import { getScrollPercentage } from '../utils/getScrollPercentage';

export const ProgressBar = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const percent = getScrollPercentage();
      setScrollPercent(percent);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
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
