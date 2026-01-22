import type { StepStatus } from '../types/landingTypes';

interface GuideBarProps {
  stepStatus: StepStatus;
  completedCount: number;
}

const STEPS = [
  { num: 1 as const, label: '포커스 모드' },
  { num: 2 as const, label: '문단 분리' },
  { num: 3 as const, label: '진행률 바' },
];

export const GuideBar = ({ stepStatus, completedCount }: GuideBarProps) => {
  const isCompleted = (stepNum: 1 | 2 | 3): boolean => {
    return stepStatus[`step${stepNum}`];
  };

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/3 완료
          </span>
          <div className="flex items-center gap-4">
            {STEPS.map((step) => {
              const completed = isCompleted(step.num);

              return (
                <div
                  key={step.num}
                  className={
                    'flex items-center gap-2 text-sm '
                    + (completed ? 'text-green-600' : 'text-gray-400')
                  }
                >
                  {completed ? (
                    <span
                      className="w-5 h-5 rounded-full bg-green-500 text-white
                        flex items-center justify-center text-xs"
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full bg-gray-200 text-gray-500
                        flex items-center justify-center text-xs"
                    >
                      {step.num}
                    </span>
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
