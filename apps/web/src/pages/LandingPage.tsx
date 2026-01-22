import { GUIDE_STEPS } from '../constants/guideContent';
import { HeroSection } from '../components/HeroSection';
import { GuideBar } from '../components/GuideBar';
import { GuideStep } from '../components/GuideStep';
import { CompletedSection } from '../components/CompletedSection';
import { useExtensionState } from '../hooks/useExtensionState';
import { useGuideProgress } from '../hooks/useGuideProgress';

const LandingPage = () => {
  const extensionState = useExtensionState();
  const { stepStatus, completedCount, isGuideComplete } = useGuideProgress();

  const isStepCompleted = (stepNumber: 1 | 2 | 3): boolean => {
    return stepStatus[`step${stepNumber}`];
  };

  return (
    <div className="min-h-screen">
      <HeroSection />

      {extensionState === 'active' && (
        <>
          <GuideBar stepStatus={stepStatus} completedCount={completedCount} />

          {GUIDE_STEPS.map((step) => (
            <GuideStep
              key={step.stepNumber}
              stepNumber={step.stepNumber}
              title={step.title}
              completed={isStepCompleted(step.stepNumber)}
              incompleteMessage={step.incompleteMessage}
              completedMessage={step.completedMessage}
              infoMessage={step.infoMessage}
              bgColor={step.bgColor}
            >
              {step.content}
            </GuideStep>
          ))}

          {isGuideComplete && <CompletedSection />}
        </>
      )}
    </div>
  );
};

export default LandingPage;
