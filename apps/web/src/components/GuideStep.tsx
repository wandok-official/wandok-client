import type { GuideStepNumber } from '../types/landingTypes';

interface GuideStepProps {
  stepNumber: GuideStepNumber;
  title: string;
  completed: boolean;
  incompleteMessage: string;
  completedMessage: string;
  children: React.ReactNode;
  infoMessage: string;
  bgColor?: 'gray' | 'white';
}

export const GuideStep = ({
  stepNumber,
  title,
  completed,
  incompleteMessage,
  completedMessage,
  children,
  infoMessage,
  bgColor = 'gray',
}: GuideStepProps) => {
  const bgClass = bgColor === 'gray' ? 'bg-gray-50' : 'bg-white';
  const articleBgClass = bgColor === 'gray' ? 'bg-white' : 'bg-gray-50';

  return (
    <section className={`min-h-screen py-20 px-4 ${bgClass} relative`}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-amber-600 font-medium">Step {stepNumber}</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">{title}</h2>
          <p className="text-gray-600 mt-2">
            {completed ? completedMessage : incompleteMessage}
          </p>
        </div>
        <article
          data-guide-step={stepNumber}
          className={`${articleBgClass} rounded-xl p-8 shadow-sm prose prose-lg max-w-none`}
        >
          {children}
        </article>
        <p className="text-gray-600 mt-5">
          {infoMessage}
        </p>
      </div>
    </section>
  );
};
