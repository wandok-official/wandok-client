import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { CloseIcon } from '../CloseIcon';

describe('CloseIcon', () => {
  afterEach(() => {
    cleanup();
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('SVG 요소가 렌더링되어야 한다', () => {
      const { container } = render(<CloseIcon />);
      const svg = container.querySelector('svg');

      expect(svg).not.toBeNull();
      expect(svg?.tagName).toBe('svg');
    });

    it('X자 모양의 두 개 line 요소를 포함해야 한다', () => {
      const { container } = render(<CloseIcon />);
      const lines = container.querySelectorAll('line');

      expect(lines.length).toBe(2);
    });

    it('첫 번째 line은 왼쪽 위에서 오른쪽 아래로 그려져야 한다', () => {
      const { container } = render(<CloseIcon />);
      const firstLine = container.querySelectorAll('line')[0];

      expect(firstLine?.getAttribute('x1')).toBe('18');
      expect(firstLine?.getAttribute('y1')).toBe('6');
      expect(firstLine?.getAttribute('x2')).toBe('6');
      expect(firstLine?.getAttribute('y2')).toBe('18');
    });

    it('두 번째 line은 왼쪽 아래에서 오른쪽 위로 그려져야 한다', () => {
      const { container } = render(<CloseIcon />);
      const secondLine = container.querySelectorAll('line')[1];

      expect(secondLine?.getAttribute('x1')).toBe('6');
      expect(secondLine?.getAttribute('y1')).toBe('6');
      expect(secondLine?.getAttribute('x2')).toBe('18');
      expect(secondLine?.getAttribute('y2')).toBe('18');
    });

    it('기본 클래스명이 적용되어야 한다', () => {
      const { container } = render(<CloseIcon />);
      const svg = container.querySelector('svg');

      expect(svg?.className).toContain('w-5');
      expect(svg?.className).toContain('h-5');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('className이 제공되지 않으면 기본값을 사용해야 한다', () => {
      const { container } = render(<CloseIcon />);
      const svg = container.querySelector('svg');

      expect(svg?.className).toContain('w-5');
      expect(svg?.className).toContain('h-5');
    });

    it('빈 문자열 className을 전달하면 빈 클래스가 적용되어야 한다', () => {
      const { container } = render(<CloseIcon className="" />);
      const svg = container.querySelector('svg');

      expect(svg?.className).toBe('');
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('동일한 props로 여러 번 렌더링해도 같은 결과를 반환해야 한다', () => {
      const { container: container1, unmount: unmount1 } = render(
        <CloseIcon className="custom-class" />,
      );
      const svg1 = container1.querySelector('svg');

      unmount1();

      const { container: container2 } = render(
        <CloseIcon className="custom-class" />,
      );
      const svg2 = container2.querySelector('svg');

      expect(svg1?.className).toBe(svg2?.className);
      expect(svg1?.outerHTML).toBe(svg2?.outerHTML);
    });

    it('여러 인스턴스가 동시에 렌더링되어도 독립적이어야 한다', () => {
      const { container } = render(
        <>
          <CloseIcon className="icon-1" />
          <CloseIcon className="icon-2" />
          <CloseIcon className="icon-3" />
        </>,
      );

      const svgs = container.querySelectorAll('svg');

      expect(svgs.length).toBe(3);
      expect(svgs[0].className).toContain('icon-1');
      expect(svgs[1].className).toContain('icon-2');
      expect(svgs[2].className).toContain('icon-3');
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('커스텀 className이 제공되면 기본값을 덮어써야 한다', () => {
      const { container } = render(<CloseIcon className="w-10 h-10" />);
      const svg = container.querySelector('svg');

      expect(svg?.className).toBe('w-10 h-10');
      expect(svg?.className).not.toContain('w-5');
      expect(svg?.className).not.toContain('h-5');
    });

    it('여러 커스텀 클래스를 조합해도 올바르게 적용되어야 한다', () => {
      const { container } = render(
        <CloseIcon className="w-8 h-8 text-red-500 hover:text-red-700" />,
      );
      const svg = container.querySelector('svg');

      expect(svg?.className).toContain('w-8');
      expect(svg?.className).toContain('h-8');
      expect(svg?.className).toContain('text-red-500');
      expect(svg?.className).toContain('hover:text-red-700');
    });

    it('SVG 속성이 올바르게 설정되어야 한다', () => {
      const { container } = render(<CloseIcon />);
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(svg?.getAttribute('fill')).toBe('none');
      expect(svg?.getAttribute('stroke')).toBe('currentColor');
      expect(svg?.getAttribute('stroke-width')).toBe('2');
      expect(svg?.getAttribute('stroke-linecap')).toBe('round');
    });

    it('currentColor를 사용하여 부모 색상을 상속받아야 한다', () => {
      const { container } = render(
        <div style={{ color: 'blue' }}>
          <CloseIcon />
        </div>,
      );
      const svg = container.querySelector('svg');

      expect(svg?.getAttribute('stroke')).toBe('currentColor');
    });

    it('접근성을 위한 기본 구조가 유지되어야 한다', () => {
      const { container } = render(<CloseIcon />);
      const svg = container.querySelector('svg');
      const lines = container.querySelectorAll('line');

      expect(svg).not.toBeNull();
      expect(lines.length).toBe(2);

      // X자 모양을 형성하는 두 라인
      lines.forEach((line) => {
        expect(line.getAttribute('x1')).not.toBeNull();
        expect(line.getAttribute('y1')).not.toBeNull();
        expect(line.getAttribute('x2')).not.toBeNull();
        expect(line.getAttribute('y2')).not.toBeNull();
      });
    });
  });
});
