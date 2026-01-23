import type { StepStatus } from '../types/landingTypes';

interface IncompleteSectionProps {
  stepStatus: StepStatus;
  completedCount: number;
}

const STEP_INFO = [
  {
    key: 'step1' as const,
    label: '포커스 모드',
    description: '읽고 있는 문장을 강조해보세요',
    emoji: '✨',
  },
  {
    key: 'step2' as const,
    label: '문단 분리',
    description: '긴 문단을 나눠보세요',
    emoji: '📝',
  },
  {
    key: 'step3' as const,
    label: '진행률 바',
    description: '스크롤로 읽기 진행도를 확인하세요',
    emoji: '📊',
  },
];

export const IncompleteSection = (
  { stepStatus, completedCount }: IncompleteSectionProps,
) => {
  const incompleteSteps = STEP_INFO.filter(step => !stepStatus[step.key]);
  const remainingCount = 3 - completedCount;

  const scrollToStep = (stepKey: string) => {
    const stepNumber = stepKey.replace('step', '');
    const element = document.querySelector(`[data-guide-step="${stepNumber}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    /* eslint-disable @stylistic/max-len */
    <section className="min-h-screen py-20 px-4 bg-linear-to-b from-gray-50 to-blue-50 flex items-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-6">🤔</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          조금만 더 체험해보세요!
        </h2>
        <p className="text-xl text-gray-600 mb-2">
          {completedCount}개의 기능을 체험하셨네요!
        </p>
        <p className="text-lg text-gray-500 mb-8">
          아직 {remainingCount}개의 기능이 남아있어요
        </p>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8">
          <h3 className="font-semibold text-gray-800 mb-6 text-lg">
            아직 체험하지 않은 기능
          </h3>
          <div className="flex flex-col gap-4">
            {incompleteSteps.map((step) => (
              <button
                key={step.key}
                onClick={() => scrollToStep(step.key)}
                className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group cursor-pointer"
              >
                <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {step.emoji}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                    {step.label}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {step.description}
                  </p>
                </div>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ↑
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <p className="text-gray-700 text-sm">
            💡 <strong>Tip:</strong> 모든 기능을 체험하면 특별한 메시지가 기다리고 있어요!
          </p>
        </div>
      </div>
    </section>
    /* eslint-enable @stylistic/max-len */
  );
};
