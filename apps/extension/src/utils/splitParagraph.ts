export const splitParagraph = (selectedElement: HTMLElement): void => {
  // wandok-text-wrapper인 경우 실제 문단(p, div 등)을 찾아야 함
  let parentBlock = selectedElement.parentElement;

  // wandok-text-wrapper의 부모가 또 다른 wandok-text-wrapper인 경우 건너뛰기
  while (parentBlock && parentBlock.classList.contains('wandok-text-wrapper')) {
    parentBlock = parentBlock.parentElement;
  }

  // 부모가 없거나 body인 경우 문서 전체 구조 깨짐 방지를 위해 중단
  if (!parentBlock || parentBlock === document.body) return;

  // 자식 노드 배열화 및 기준점 탐색
  const childNodes = Array.from(parentBlock.childNodes);
  const selectedElementIndex = childNodes.indexOf(selectedElement);

  if (selectedElementIndex === -1) return;

  // 새로운 문단 컨테이너 생성
  const newBlock = parentBlock.cloneNode(false) as HTMLElement;

  newBlock.removeAttribute('id');
  newBlock.classList.add('wandok-split-paragraph');

  // 이동할 노드 선정
  const nodesToMove = childNodes.slice(selectedElementIndex);

  nodesToMove.forEach((node) => {
    newBlock.appendChild(node);
  });

  // 기존 문단 바로 뒤에 새 문단 삽입
  parentBlock.after(newBlock);
};
