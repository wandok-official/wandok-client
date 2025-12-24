/**
 * 특정 요소에 호버했을 때 나머지 문단들을 블러 처리하는 함수
 */
export const applyBlurEffect = (
  targetBlock: HTMLElement,
  allBlocks: Set<HTMLElement>,
  isEnter: boolean
) => {
  if (!isEnter) {
    // 마우스가 나갔을 때: 모든 블러 제거
    allBlocks.forEach((el) => el.classList.remove('wandok-blur'));
    return;
  }

  // 마우스가 들어왔을 때: 관련 없는 요소만 블러 처리
  allBlocks.forEach((el) => {
    const isRelated =
      el === targetBlock ||
      el.contains(targetBlock) ||
      targetBlock.contains(el);

    if (isRelated) {
      el.classList.remove('wandok-blur');
    } else {
      el.classList.add('wandok-blur');
    }
  });
};
