import { useEffect, useRef, useState } from 'react';

import { PROGRESS_BAR } from '../config/constants';
import { getScrollPercentage } from '../utils/getScrollPercentage';

export const ProgressBar = () => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const updateScrollPercent = () => {
      frameIdRef.current = null;
      setScrollPercent(getScrollPercentage());
    };

    const scheduleUpdate = () => {
      if (frameIdRef.current !== null) return;

      frameIdRef.current = requestAnimationFrame(updateScrollPercent);
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    // 본문 높이가 바뀌면(이미지 로드 등) scroll 없이도 진행률을 다시 계산한다.
    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleUpdate);

    if (resizeObserver && document.body) {
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      resizeObserver?.disconnect();

      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
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
