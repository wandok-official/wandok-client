import { useState, useEffect, useRef } from 'react';
import { PROGRESS_BAR } from '../config/constants';
import { getScrollPercentage } from '../utils/getScrollPercentage';
import type { ComplexityData } from '../types/complexity';
import { useComplexityChartData } from '../hooks/useComplexityChartData';
import { ComplexityChart } from './ComplexityChart';

export const ProgressBar = ({ complexityScores = [] }: Partial<ComplexityData>) => {
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

  const chartData = useComplexityChartData({ complexityScores, scrollPercent });

  return (
    <div
      className="fixed top-0 right-0 h-screen"
      style={{ width: PROGRESS_BAR.WIDTH }}
    >
      <ComplexityChart {...chartData} />
    </div>
  );
};
