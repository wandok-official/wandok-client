import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotePopover } from '../NotePopover';
import { mockConsole } from '@test/helpers/test-utils';

describe('NotePopover', () => {
  let onClose: Mock<() => void>;
  let onSubmit: Mock<(noteText: string) => void>;

  beforeEach(() => {
    onClose = vi.fn();
    onSubmit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('컴포넌트가 올바르게 렌더링되어야 한다', () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      expect(screen.getByText('테스트 유저')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument();
    });

    it('닫기 버튼 클릭 시 onClose가 호출되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const closeButton = screen.getByRole('button', { name: '' });
      await userEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('텍스트 입력 후 작성 버튼 클릭 시 onSubmit이 입력된 텍스트와 함께 호출되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      await userEvent.type(textarea, '테스트 노트 내용');
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('테스트 노트 내용');
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('textarea에 입력한 값이 화면에 표시되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, '새로운 메모');

      expect(textarea).toHaveValue('새로운 메모');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('빈 텍스트일 경우 작성 버튼이 비활성화되어야 한다', () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const submitButton = screen.getByRole('button', { name: '작성' });

      expect(submitButton).toBeDisabled();
    });

    it('빈 텍스트일 때 작성 버튼을 클릭해도 onSubmit이 호출되지 않아야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const submitButton = screen.getByRole('button', { name: '작성' });

      await userEvent.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('공백만 입력된 경우 작성 버튼이 비활성화되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      await userEvent.type(textarea, '   ');

      expect(submitButton).toBeDisabled();
    });

    it('공백만 입력된 경우 작성 버튼을 클릭해도 onSubmit이 호출되지 않아야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      await userEvent.type(textarea, '   ');
      await userEvent.click(submitButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================

  describe('동일 입력 → 동일 출력', () => {
    it('동일한 텍스트 입력 시 동일한 값이 onSubmit에 전달되어야 한다', async () => {
      const { unmount } = render(
        <NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />,
      );

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      await userEvent.type(textarea, '동일한 텍스트');
      await userEvent.click(submitButton);

      const firstCallArg = onSubmit.mock.calls[0][0];

      unmount();

      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea2 = screen.getByRole('textbox');
      const submitButton2 = screen.getByRole('button', { name: '작성' });

      await userEvent.type(textarea2, '동일한 텍스트');
      await userEvent.click(submitButton2);

      const secondCallArg = onSubmit.mock.calls[1][0];

      expect(firstCallArg).toBe(secondCallArg);
      expect(firstCallArg).toBe('동일한 텍스트');
    });
  });

  // ==================== 에러 상황 및 복구 ====================

  describe('에러 상황 및 복구', () => {
    it('onClose 콜백이 에러를 throw해도 콜백은 호출되어야 한다', () => {
      const { restore } = mockConsole('error');

      onClose.mockImplementation(() => {
        throw new Error('Close error');
      });

      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const closeButton = screen.getByRole('button', { name: '' });

      // React가 에러를 처리하므로 직접 toThrow 테스트 불가
      // 대신 콜백이 호출되었는지 확인
      try {
        fireEvent.click(closeButton);
      } catch {
        // 에러 무시
      }

      expect(onClose).toHaveBeenCalled();
      restore();
    });

    it('onSubmit 콜백이 에러를 throw해도 콜백은 호출되어야 한다', () => {
      const { restore } = mockConsole('error');

      onSubmit.mockImplementation(() => {
        throw new Error('Submit error');
      });

      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      fireEvent.change(textarea, { target: { value: '테스트' } });

      try {
        fireEvent.click(submitButton);
      } catch {
        // 에러 무시
      }

      expect(onSubmit).toHaveBeenCalledWith('테스트');
      restore();
    });
  });

  // ==================== 사용자 인터랙션 ====================

  describe('사용자 인터랙션', () => {
    it('textarea에 여러 줄 텍스트를 입력할 수 있어야 한다', () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');

      fireEvent.change(textarea, { target: { value: '첫 번째 줄\n두 번째 줄\n세 번째 줄' } });

      expect(textarea).toHaveValue('첫 번째 줄\n두 번째 줄\n세 번째 줄');
    });

    it('특수문자가 포함된 텍스트도 정상적으로 제출되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      fireEvent.change(textarea, { target: { value: '특수문자: !@#$%^&*()_+{}[]' } });
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('특수문자: !@#$%^&*()_+{}[]');
    });

    it('한글, 영어, 이모지가 혼합된 텍스트도 정상적으로 제출되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      fireEvent.change(textarea, { target: { value: '안녕 Hello 👋 世界' } });
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith('안녕 Hello 👋 世界');
    });

    it('긴 텍스트도 정상적으로 처리되어야 한다', async () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const textarea = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: '작성' });

      const longText = 'a'.repeat(1000);
      fireEvent.change(textarea, { target: { value: longText } });
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith(longText);
    });
  });

  // ==================== UI 요소 확인 ====================

  describe('UI 요소 확인', () => {
    it('CloseIcon이 닫기 버튼 내에 렌더링되어야 한다', () => {
      render(<NotePopover onClose={onClose} onSubmit={onSubmit} username="테스트 유저" />);

      const closeButton = screen.getByRole('button', { name: '' });
      const svg = closeButton.querySelector('svg');

      expect(svg).toBeInTheDocument();
    });
  });
});
