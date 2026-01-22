/**
 * 현재 스크롤 진행률을 백분율로 반환
 */
export const getScrollPercentage = (): number => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) return 0;

  return Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
};
