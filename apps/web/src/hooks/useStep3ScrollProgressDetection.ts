import { useEffect } from 'react';

const STEP3_SELECTOR = 'article[data-guide-step="3"]';

/**
 * Step 3: 스크롤 진행률 기능 체험 감지
 * Step 3 영역이 뷰포트에 진입하면 완료 처리
 */
export const useStep3ScrollProgressDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  useEffect(() => {
    if (isCompleted) return;

    const observeStep3 = (element: Element) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            onComplete();
          }
        },
        { threshold: 0 },
      );

      observer.observe(element);

      return observer;
    };

    const step3Element = document.querySelector(STEP3_SELECTOR);

    if (step3Element) {
      const observer = observeStep3(step3Element);
      return () => observer.disconnect();
    }

    const mutationObserver = new MutationObserver((_mutations, obs) => {
      const element = document.querySelector(STEP3_SELECTOR);
      if (element) {
        obs.disconnect();
        observeStep3(element);
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => mutationObserver.disconnect();
  }, [isCompleted, onComplete]);
};
