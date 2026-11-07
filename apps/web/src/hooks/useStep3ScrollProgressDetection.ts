import { useEffect } from 'react';

const STEP3_SELECTOR = 'article[data-guide-step="3"]';

/**
 * Step 3: 스크롤 진행률 기능 체험 감지
 * Step 3 영역이 뷰포트에 진입하면 완료 처리
 *
 * 가이드는 익스텐션이 켜질 때만 마운트된다.
 * 요소를 한 번 찾은 뒤 observer를 끊으면, 끄고 다시 켠 새 요소는 감지하지 못한다.
 */
export const useStep3ScrollProgressDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  useEffect(() => {
    if (isCompleted) return;

    let isActive = true;
    let observedElement: Element | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    const stopObservingElement = () => {
      intersectionObserver?.disconnect();
      intersectionObserver = null;
      observedElement = null;
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      if (!isActive) return;

      const isVisible = entries.some((entry) => entry.isIntersecting);
      if (!isVisible) return;

      isActive = false;
      stopObservingElement();
      onComplete();
    };

    const observeElement = (element: Element) => {
      if (element === observedElement) return;

      stopObservingElement();
      observedElement = element;
      intersectionObserver = new IntersectionObserver(handleIntersect, { threshold: 0 });
      intersectionObserver.observe(element);
    };

    const syncTarget = () => {
      if (!isActive) return;

      const element = document.querySelector(STEP3_SELECTOR);
      if (!element) {
        stopObservingElement();
        return;
      }

      observeElement(element);
    };

    syncTarget();

    const mutationObserver = new MutationObserver(syncTarget);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      isActive = false;
      stopObservingElement();
      mutationObserver.disconnect();
    };
  }, [isCompleted, onComplete]);
};
