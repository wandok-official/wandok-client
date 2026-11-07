import { BLOCK_SELECTOR } from '../config/constants';

const hasRemainingContent = (parent: HTMLElement): boolean => {
  return Array.from(parent.childNodes).some((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return Boolean(node.textContent?.trim());
    }

    return node.nodeType === Node.ELEMENT_NODE;
  });
};

/**
 * parent를 pivot 위치에서 둘로 나눈다.
 * pivot과 그 뒤 노드는 복제된 형제로 이동한다.
 */
const splitElementAt = (
  parent: HTMLElement,
  pivot: ChildNode,
  isSplitParagraph: boolean,
): HTMLElement | null => {
  const childNodes = Array.from(parent.childNodes);
  const pivotIndex = childNodes.indexOf(pivot);

  if (pivotIndex === -1) return null;

  const clone = parent.cloneNode(false) as HTMLElement;
  clone.removeAttribute('id');

  if (isSplitParagraph) {
    clone.classList.add('wandok-split-paragraph');
  }

  childNodes.slice(pivotIndex).forEach((node) => {
    clone.appendChild(node);
  });

  parent.after(clone);

  // strong/em 처럼 문장만 감싼 요소는 비면 제거한다.
  // 문단 블록 자체는 비어 있어도 문서 구조를 유지하기 위해 남긴다.
  if (!isSplitParagraph && !hasRemainingContent(parent)) {
    if (parent.id) {
      clone.id = parent.id;
    }
    parent.remove();
  }

  return clone;
};

/**
 * 클릭한 문장 위치에서 문단 블록을 나눈다.
 * 문장이 strong, em 안에 있어도 그 인라인 요소가 아니라
 * 포커스 모드와 같은 블록(p, div, li 등)을 기준으로 분리한다.
 */
export const splitParagraph = (selectedElement: HTMLElement): void => {
  const block = selectedElement.closest(BLOCK_SELECTOR);

  if (!(block instanceof HTMLElement) || block === document.body || block === selectedElement) {
    return;
  }

  const ancestorChain: HTMLElement[] = [];
  let current: HTMLElement | null = selectedElement;

  while (current && current !== block) {
    ancestorChain.push(current);
    current = current.parentElement;
  }

  if (current !== block) return;

  let pivot: ChildNode = selectedElement;

  for (let index = 0; index < ancestorChain.length - 1; index += 1) {
    const parent = ancestorChain[index + 1];
    const clone = splitElementAt(parent, pivot, false);
    if (!clone) return;
    pivot = clone;
  }

  splitElementAt(block, pivot, true);
};
