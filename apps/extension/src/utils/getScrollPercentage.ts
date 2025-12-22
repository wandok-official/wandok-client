export const getScrollPercentage = (): number => {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight;
  const windowHeight = window.innerHeight;

  const scrollableArea = documentHeight - windowHeight;

  if (scrollableArea <= 0) {
    return 100;
  }

  const scrollPercentage = Math.floor((scrollTop / scrollableArea) * 100);

  return Math.min(100, Math.max(0, scrollPercentage));
};
