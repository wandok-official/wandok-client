import { useEffect, useRef } from 'react';

const STEP1_SELECTOR = 'article[data-guide-step="1"]';

/**
 * Step 1: 포커스 모드 체험 감지
 * 사용자가 Step 1 영역 내 텍스트에 마우스를 올려 포커스 모드가 작동하면 완료 처리
 */
export const useStep1FocusModeDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  const focusDetected = useRef(false);
  const isInsideStep1 = useRef(false);

  useEffect(() => {
    if (isCompleted) return;

    const step1Article = document.querySelector(STEP1_SELECTOR);
    if (!step1Article) return;

    const handleMouseEnter = () => {
      isInsideStep1.current = true;
    };
    const handleMouseLeave = () => {
      isInsideStep1.current = false;
    };

    step1Article.addEventListener('mouseenter', handleMouseEnter);
    step1Article.addEventListener('mouseleave', handleMouseLeave);

    const handleFocusHover = () => {
      if (!focusDetected.current && isInsideStep1.current) {
        focusDetected.current = true;
        onComplete();
      }
    };

    window.addEventListener('wandok:focus-hover', handleFocusHover);

    return () => {
      step1Article.removeEventListener('mouseenter', handleMouseEnter);
      step1Article.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('wandok:focus-hover', handleFocusHover);
    };
  }, [isCompleted, onComplete]);
};
