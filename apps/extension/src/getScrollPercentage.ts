export const getScrollPercentage = () => {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    const scrollableArea = documentHeight - windowHeight;

    const scrollPercentage = Math.floor((scrollTop / scrollableArea) * 100);

    return scrollPercentage;
  });
};
