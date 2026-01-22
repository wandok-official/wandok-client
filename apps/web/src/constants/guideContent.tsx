import type { GuideStepNumber } from '../types/landingTypes';
import step1Content from './guideContent.step1.txt?raw';
import step2Content from './guideContent.step2.txt?raw';
import step3Content from './guideContent.step3.txt?raw';

interface GuideStepData {
  stepNumber: GuideStepNumber;
  title: string;
  incompleteMessage: string;
  completedMessage: string;
  bgColor: 'gray' | 'white';
  content: React.ReactNode;
  infoMessage: string;
}

const renderParagraphs = (content: string) => {
  return content
    .trim()
    .split(/\n\s*\n/)
    .map((paragraph, index) => (
      <p key={index}>{paragraph.replace(/\s*\n\s*/g, ' ')}</p>
    ));
};

export const GUIDE_STEPS: GuideStepData[] = [
  {
    stepNumber: 1,
    title: '포커스 모드',
    incompleteMessage: '👆 아래 텍스트 위에 마우스를 올려보세요',
    completedMessage: '✅ 완료! 포커스 모드를 체험했습니다.',
    bgColor: 'gray',
    content: <>{renderParagraphs(step1Content)}</>,
    infoMessage: '텍스트에 마우스를 올리면 해당 부분이 강조됩니다. 그 순간을 이용해 문장을 끝까지 따라가 보세요.',
  },
  {
    stepNumber: 2,
    title: '문단 분리',
    incompleteMessage: '👆 긴 문단의 중간 문장을 클릭해보세요',
    completedMessage: '✅ 완료! 문단 분리 기능을 체험했습니다.',
    bgColor: 'white',
    content: <>{renderParagraphs(step2Content)}</>,
    infoMessage: '긴 문단에서 중간 문장을 클릭해 문단을 분리해보세요.',
  },
  {
    stepNumber: 3,
    title: '진행률 바',
    incompleteMessage: '👉 오른쪽의 진행률 바를 확인하며 스크롤해보세요',
    completedMessage: '✅ 완료! 진행률 바를 확인했습니다.',
    bgColor: 'gray',
    content: <>{renderParagraphs(step3Content)}</>,
    infoMessage: '스크롤을 내리며 채워지는 진행률 바를 확인해보세요.',
  },
];
