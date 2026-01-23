import { expect, vi } from 'vitest';

/**
 * 마이크로태스크 큐 플러시 (다음 틱 대기)
 */
export const tick = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * 지정된 시간(ms) 대기
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * DOM 이벤트 시뮬레이션 헬퍼
 */
export const fireEvent = {
  mouseUp: (element: Element | Document = document): void => {
    const event = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  },

  mouseDown: (element: Element | Document = document): void => {
    const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  },

  click: (element: Element): void => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  },

  mouseEnter: (element: Element): void => {
    const event = new MouseEvent('mouseenter', { bubbles: true });
    element.dispatchEvent(event);
  },

  mouseLeave: (element: Element): void => {
    const event = new MouseEvent('mouseleave', { bubbles: true });
    element.dispatchEvent(event);
  },

  scroll: (element: Element | Window = window): void => {
    const event = new Event('scroll', { bubbles: true });
    element.dispatchEvent(event);
  },

  input: (element: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
    element.value = value;
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);
  },

  change: (element: HTMLInputElement | HTMLTextAreaElement, value: string): void => {
    element.value = value;
    const event = new Event('change', { bubbles: true });
    element.dispatchEvent(event);
  },
};

/**
 * 테스트용 DOM 구조 생성
 * @returns container와 cleanup 함수를 포함한 객체
 */
export const createTestDOM = (html: string): { container: HTMLElement; cleanup: () => void } => {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  return {
    container,
    cleanup: () => {
      container.remove();
    },
  };
};

/**
 * 엘리먼트가 특정 클래스를 가지고 있는지 확인
 */
export const hasClass = (element: Element, className: string): boolean => {
  return element.classList.contains(className);
};

/**
 * 여러 클래스를 모두 가지고 있는지 확인
 */
export const hasAllClasses = (element: Element, classNames: string[]): boolean => {
  return classNames.every((className) => element.classList.contains(className));
};

/**
 * 텍스트 노드 포함 여부 확인
 */
export const containsText = (element: Element, text: string): boolean => {
  return element.textContent?.includes(text) ?? false;
};

/**
 * 자식 엘리먼트 개수 확인
 */
export const countChildren = (element: Element, selector?: string): number => {
  if (selector) {
    return element.querySelectorAll(selector).length;
  }
  return element.children.length;
};

/**
 * Mock 함수 호출 횟수 검증 헬퍼
 */
export const expectCalledTimes = (
  mockFn: ReturnType<typeof vi.fn>,
  times: number,
): void => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

/**
 * Mock 함수가 특정 인자로 호출되었는지 검증
 */
export const expectCalledWith = (
  mockFn: ReturnType<typeof vi.fn>,
  ...args: unknown[]
): void => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

/**
 * 비동기 함수 실행 후 결과 대기
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 1000,
  interval = 50,
): Promise<void> => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within timeout (${timeout}ms)`);
    }
    await wait(interval);
  }
};

/**
 * console 메서드 mock 및 복원 헬퍼
 */
export const mockConsole = (method: 'log' | 'warn' | 'error' | 'info' = 'log') => {
  const spy = vi.spyOn(console, method).mockImplementation(() => { });

  return {
    spy,
    restore: () => spy.mockRestore(),
    expectCalled: () => expect(spy).toHaveBeenCalled(),
    expectNotCalled: () => expect(spy).not.toHaveBeenCalled(),
  };
};
