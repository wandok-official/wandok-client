import { useEffect, useRef } from 'react';
import { getScrollPercentage } from '../utils/getScrollPercentage';

const SCROLL_COMPLETE_THRESHOLD = 99;
const STEP3_SELECTOR = 'article[data-guide-step="3"]';

/**
 * Step 3: 스크롤 진행률 기능 체험 감지
 * 사용자가 페이지를 끝까지 스크롤하면 완료 처리
 */
export const useStep3ScrollProgressDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  const progressEventFired = useRef(false);

  useEffect(() => {
    if (isCompleted) return;

    const handleScroll = () => {
      if (progressEventFired.current) return;

      const percent = getScrollPercentage();
      if (percent >= SCROLL_COMPLETE_THRESHOLD) {
        progressEventFired.current = true;
        onComplete();
      }
    };

    const startScrollTracking = () => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          handleScroll();
        });
      });
    };

    if (document.querySelector(STEP3_SELECTOR)) {
      startScrollTracking();
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new MutationObserver((_mutations, obs) => {
      if (document.querySelector(STEP3_SELECTOR)) {
        obs.disconnect();
        startScrollTracking();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isCompleted, onComplete]);
};
