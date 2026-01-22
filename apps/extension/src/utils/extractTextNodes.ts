export const extractTextNodes = (
  root: HTMLElement,
  excludeTags: string[] = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'],
): Text[] => {
  if (!root) return [];

  const treeWalker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        if (node.parentElement && excludeTags.includes(node.parentElement.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (!node.textContent?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        // 이미 wandok-text-wrapper로 처리된 요소 안의 텍스트는 제외
        if (node.parentElement?.classList.contains('wandok-text-wrapper')) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const textNodes: Text[] = [];
  let node: Node | null;

  while ((node = treeWalker.nextNode())) {
    textNodes.push((node as Text));
  }

  return textNodes;
};
