import { useEffect, useRef } from 'react';

const STEP2_SELECTOR = 'article[data-guide-step="2"]';

/**
 * Step 2: 문단 분리 기능 체험 감지
 * 사용자가 Step 2 영역에서 문단을 분리하면 완료 처리
 */
export const useStep2ParagraphSplitDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  const splitDetected = useRef(false);
  const isInsideStep2 = useRef(false);

  useEffect(() => {
    if (isCompleted) return;

    const step2Article = document.querySelector(STEP2_SELECTOR);
    if (!step2Article) return;

    const handleMouseEnter = () => {
      isInsideStep2.current = true;
    };
    const handleMouseLeave = () => {
      isInsideStep2.current = false;
    };

    step2Article.addEventListener('mouseenter', handleMouseEnter);
    step2Article.addEventListener('mouseleave', handleMouseLeave);

    const handleSplit = () => {
      if (!splitDetected.current && isInsideStep2.current) {
        splitDetected.current = true;
        onComplete();
      }
    };

    window.addEventListener('wandok:paragraph-split', handleSplit);

    return () => {
      step2Article.removeEventListener('mouseenter', handleMouseEnter);
      step2Article.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('wandok:paragraph-split', handleSplit);
    };
  }, [isCompleted, onComplete]);
};
