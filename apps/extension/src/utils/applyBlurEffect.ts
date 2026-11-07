/**
 * 특정 요소에 호버했을 때 나머지 문단들을 블러 처리하는 함수
 * SPA에서 제거된 블록은 Set에 남으면 매 호버마다 순회되므로 함께 정리한다.
 */
export const applyBlurEffect = (
  targetBlock: HTMLElement,
  allBlocks: Set<HTMLElement>,
  isEnter: boolean,
) => {
  allBlocks.forEach((element) => {
    if (!element.isConnected) {
      allBlocks.delete(element);
    }
  });

  if (!isEnter) {
    // 마우스가 나갔을 때: 모든 블러 제거
    allBlocks.forEach((element) => element.classList.remove('wandok-blur'));
    return;
  }

  // 마우스가 들어왔을 때: 관련 없는 요소만 블러 처리
  allBlocks.forEach((element) => {
    const isRelated =
      element === targetBlock ||
      element.contains(targetBlock) ||
      targetBlock.contains(element);

    if (isRelated) {
      element.classList.remove('wandok-blur');
    } else {
      element.classList.add('wandok-blur');
    }
  });
};
