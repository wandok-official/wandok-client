import { BLOCK_SELECTOR } from '../config/constants';

/**
 * 화이트리스트: 본문 콘텐츠 영역
 *
 * Brunch: .wrap_body, #ArticleView
 * Velog: .atom-one
 */
const CONTENT_SELECTORS =
  'article, main, [role="main"], .post-content, .article-body, ' +
  '.wrap_body, #ArticleView, .atom-one';

/**
 * 블랙리스트: 인터랙티브/동적 요소
 */
const EXCLUDED_SELECTORS = 'button, a, [onclick], [role="button"], nav, header, footer';

/**
 * 특정 요소의 가장 가까운 문단(Block) 요소를 찾는 헬퍼 함수
 */
export const getClosestBlock = (el: HTMLElement): HTMLElement | null => {
  return el.closest(BLOCK_SELECTOR) as HTMLElement | null;
};

/**
 * 요소가 처리 대상인지 확인하는 헬퍼 함수
 * - 본문 콘텐츠 영역 안에 있어야 함
 * - 인터랙티브 요소 안에 있으면 제외
 */
export const isArticleContent = (element: HTMLElement): boolean => {
  if (!element.closest(CONTENT_SELECTORS)) return false;

  if (element.closest(EXCLUDED_SELECTORS)) return false;

  return true;
};
