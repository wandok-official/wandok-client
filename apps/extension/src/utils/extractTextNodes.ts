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
