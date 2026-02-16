/**
 * wandok-text-wrapper span을 원래 텍스트 노드로 복원
 * processTextNode로 생성된 span을 제거하고 원본 DOM 구조를 복원
 */
export const restoreTextWrappers = (): void => {
  const wrappers = document.querySelectorAll('.wandok-text-wrapper');

  wrappers.forEach((wrapper) => {
    const parent = wrapper.parentNode;

    if (!parent) return;

    const textNode = document.createTextNode(wrapper.textContent ?? '');

    parent.replaceChild(textNode, wrapper);
    parent.normalize();
  });
};
