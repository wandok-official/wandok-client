import { useState, useCallback } from 'react';
import type { StepStatus } from '../types/landingTypes';
import { useStep1FocusModeDetection } from './useStep1FocusModeDetection';
import { useStep2ParagraphSplitDetection } from './useStep2ParagraphSplitDetection';
import { useStep3ScrollProgressDetection } from './useStep3ScrollProgressDetection';

interface UseGuideProgressReturn {
  stepStatus: StepStatus;
  completedCount: number;
  isGuideComplete: boolean;
}

/**
 * 가이드 진행 상태를 관리하는 커스텀 훅
 */
export const useGuideProgress = (): UseGuideProgressReturn => {
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    step1: false,
    step2: false,
    step3: false,
  });

  const completeStep1 = useCallback(() => {
    setStepStatus((prev) => ({ ...prev, step1: true }));
  }, []);

  const completeStep2 = useCallback(() => {
    setStepStatus((prev) => ({ ...prev, step2: true }));
  }, []);

  const completeStep3 = useCallback(() => {
    setStepStatus((prev) => ({ ...prev, step3: true }));
  }, []);

  useStep1FocusModeDetection(stepStatus.step1, completeStep1);
  useStep2ParagraphSplitDetection(stepStatus.step2, completeStep2);
  useStep3ScrollProgressDetection(stepStatus.step3, completeStep3);

  const completedCount = Object.values(stepStatus).filter(Boolean).length;
  const isGuideComplete = completedCount === 3;

  return {
    stepStatus,
    completedCount,
    isGuideComplete,
  };
};
