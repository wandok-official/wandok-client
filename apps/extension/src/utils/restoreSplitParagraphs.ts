/**
 * 분리된 문단을 원래 상태로 복원
 * splitParagraph로 생성된 wandok-split-paragraph 요소들을 역순으로 병합
 */
export const restoreSplitParagraphs = (allBlockElements: Set<HTMLElement>): void => {
  const splitParagraphs = Array.from(
    document.querySelectorAll('.wandok-split-paragraph'),
  ).reverse();

  splitParagraphs.forEach((splitBlock) => {
    const previousSibling = splitBlock.previousElementSibling;
    if (!previousSibling) return;

    while (splitBlock.firstChild) {
      previousSibling.appendChild(splitBlock.firstChild);
    }

    allBlockElements.delete(splitBlock as HTMLElement);
    splitBlock.remove();
  });
};
