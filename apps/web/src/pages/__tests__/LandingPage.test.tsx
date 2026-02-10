import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LandingPage from '../LandingPage';

vi.mock('../../hooks/useExtensionState', () => ({
  useExtensionState: vi.fn(),
}));

vi.mock('../../hooks/useGuideProgress', () => ({
  useGuideProgress: vi.fn(),
}));

import { useExtensionState } from '../../hooks/useExtensionState';
import { useGuideProgress } from '../../hooks/useGuideProgress';

const mockExtensionState = vi.mocked(useExtensionState);
const mockGuideProgress = vi.mocked(useGuideProgress);

const setupMocks = (
  extensionState: 'active' | 'inactive',
  stepStatus = { step1: false, step2: false, step3: false },
) => {
  const completedCount = Object.values(stepStatus).filter(Boolean).length;
  mockExtensionState.mockReturnValue(extensionState);
  mockGuideProgress.mockReturnValue({
    stepStatus,
    completedCount,
    isGuideComplete: completedCount === 3,
  });
};

describe('LandingPage', () => {
  it('inactive 상태에서 HeroSection과 Footer만 렌더링해야 한다', () => {
    setupMocks('inactive');

    render(<LandingPage />);

    expect(screen.getByRole('heading', { level: 1, name: '완독이' })).toBeDefined();
    expect(screen.queryByText(/\/3 완료/)).toBeNull();
    expect(screen.queryByText('Step 1')).toBeNull();
  });

  it('active + 미완료 상태에서 GuideBar와 GuideStep을 렌더링하고, 하단 섹션은 없어야 한다', () => {
    setupMocks('active');

    render(<LandingPage />);

    expect(screen.getByText('0/3 완료')).toBeDefined();
    expect(screen.getByText('Step 1')).toBeDefined();
    expect(screen.getByText('Step 2')).toBeDefined();
    expect(screen.getByText('Step 3')).toBeDefined();
    expect(screen.queryByText('축하합니다!')).toBeNull();
    expect(screen.queryByText('조금만 더 체험해보세요!')).toBeNull();
  });

  it('일부 step 완료 시 IncompleteSection을 렌더링해야 한다', () => {
    setupMocks('active', { step1: true, step2: false, step3: false });

    render(<LandingPage />);

    expect(screen.getByText('1/3 완료')).toBeDefined();
    expect(screen.getByText('조금만 더 체험해보세요!')).toBeDefined();
    expect(screen.queryByText('축하합니다!')).toBeNull();
  });

  it('모든 step 완료 시 CompletedSection을 렌더링해야 한다', () => {
    setupMocks('active', { step1: true, step2: true, step3: true });

    render(<LandingPage />);

    expect(screen.getByText('3/3 완료')).toBeDefined();
    expect(screen.getByText('축하합니다!')).toBeDefined();
    expect(screen.queryByText('조금만 더 체험해보세요!')).toBeNull();
  });
});
