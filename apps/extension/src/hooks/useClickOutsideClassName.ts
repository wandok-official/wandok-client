import { useEffect } from 'react';

export const useClickOutsideClassName = (
  isEnabled: boolean,
  className: string,
  onClickOutside: () => void,
): void => {
  useEffect(() => {
    if (!isEnabled) return;

    const handleClickOutside = (e: MouseEvent) => {
      const path = e.composedPath();
      const isClickInsideElement = path.some(
        (element) =>
          element instanceof HTMLElement &&
          element.classList?.contains(className),
      );

      if (!isClickInsideElement) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEnabled, className, onClickOutside]);
};
