export type ExtensionState = 'inactive' | 'active';

export type GuideStepNumber = 1 | 2 | 3;

export interface StepStatus {
  step1: boolean;
  step2: boolean;
  step3: boolean;
}

export interface GuideStepContent {
  stepNumber: GuideStepNumber;
  title: string;
  incompleteMessage: string;
  completedMessage: string;
  content: React.ReactNode;
}
