import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { splitParagraph } from '../splitParagraph';

describe('splitParagraph', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('선택된 요소를 기준으로 문단을 분리해야 한다', () => {
      const html = '<p><span class="s1">첫번째</span>' +
        '<span class="s2">두번째</span><span class="s3">세번째</span></p>';
      container.innerHTML = html;
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('첫번째');
      expect(paragraphs[1].textContent).toBe('두번째세번째');
    });

    it('분리된 새 문단이 원본 바로 다음에 위치해야 한다', () => {
      const html = '<p id="original"><span class="s1">A</span>' +
        '<span class="s2">B</span></p>';
      container.innerHTML = html;
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs[0].id).toBe('original');
      expect(paragraphs[1].id).toBe('');
      expect(paragraphs[0].nextElementSibling).toBe(paragraphs[1]);
    });

    it('새 문단에 wandok-split-paragraph 클래스가 추가되어야 한다', () => {
      container.innerHTML = '<p><span class="s1">A</span><span class="s2">B</span></p>';
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const newParagraph = container.querySelectorAll('p')[1];
      expect(newParagraph.classList.contains('wandok-split-paragraph')).toBe(true);
    });

    it('마지막 자식 요소를 선택하면 새 문단은 마지막만 포함해야 한다', () => {
      container.innerHTML = '<p><span>First</span><span class="last">Last</span></p>';
      const lastElement = container.querySelector('.last') as HTMLElement;

      splitParagraph(lastElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('First');
      expect(paragraphs[1].textContent).toBe('Last');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('부모가 없는 요소는 분리하지 않아야 한다', () => {
      const orphanElement = document.createElement('span');
      orphanElement.textContent = 'orphan';

      splitParagraph(orphanElement);

      expect(container.children.length).toBe(0);
    });

    it('부모가 body인 요소는 분리하지 않아야 한다', () => {
      const spanInBody = document.createElement('span');
      spanInBody.textContent = 'in body';
      document.body.appendChild(spanInBody);

      splitParagraph(spanInBody);

      expect(document.body.querySelectorAll('p').length).toBe(0);
      
      document.body.removeChild(spanInBody);
    });

    it('첫번째 자식 요소를 선택하면 원본은 비워야 한다', () => {
      container.innerHTML = '<p><span class="first">First</span><span>Second</span></p>';
      const firstElement = container.querySelector('.first') as HTMLElement;

      splitParagraph(firstElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('');
      expect(paragraphs[1].textContent).toBe('FirstSecond');
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('원본 문단의 태그 타입을 새 문단에도 유지해야 한다', () => {
      const html = '<div class="test"><span class="s1">A</span>' +
        '<span class="s2">B</span></div>';
      container.innerHTML = html;
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const divs = container.querySelectorAll('div');
      expect(divs.length).toBe(2);
      expect(divs[0].tagName).toBe('DIV');
      expect(divs[1].tagName).toBe('DIV');
    });

    it('원본 문단의 클래스를 새 문단에 복사해야 한다', () => {
      const html = '<p class="original custom"><span class="s1">A</span>' +
        '<span class="s2">B</span></p>';
      container.innerHTML = html;
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const newParagraph = container.querySelectorAll('p')[1];
      expect(newParagraph.classList.contains('original')).toBe(true);
      expect(newParagraph.classList.contains('custom')).toBe(true);
      expect(newParagraph.classList.contains('wandok-split-paragraph')).toBe(true);
    });

    it('새 문단에서 id 속성을 제거해야 한다', () => {
      container.innerHTML = '<p id="unique"><span class="s1">A</span><span class="s2">B</span></p>';
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs[0].id).toBe('unique');
      expect(paragraphs[1].id).toBe('');
      expect(paragraphs[1].hasAttribute('id')).toBe(false);
    });

    it('중첩된 구조를 올바르게 이동해야 한다', () => {
      const html = '<p><span>A</span>' +
        '<span class="selected"><strong>B</strong><em>C</em></span></p>';
      container.innerHTML = html;
      const selectedElement = container.querySelector('.selected') as HTMLElement;

      splitParagraph(selectedElement);

      const newParagraph = container.querySelectorAll('p')[1];
      expect(newParagraph.querySelector('strong')?.textContent).toBe('B');
      expect(newParagraph.querySelector('em')?.textContent).toBe('C');
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('연속 분리 및 복잡한 시나리오', () => {
    it('이미 분리된 문단을 다시 분리할 수 있어야 한다', () => {
      const html = '<p><span class="s1">A</span>' +
        '<span class="s2">B</span><span class="s3">C</span></p>';
      container.innerHTML = html;
      
      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);
      
      expect(container.querySelectorAll('p').length).toBe(2);
      
      const s3 = container.querySelector('.s3') as HTMLElement;
      splitParagraph(s3);
      
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].textContent).toBe('A');
      expect(paragraphs[1].textContent).toBe('B');
      expect(paragraphs[2].textContent).toBe('C');
    });
  });
});
