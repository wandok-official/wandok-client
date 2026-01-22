import { WelcomeCard } from './WelcomeCard';
import { FeatureCard } from './FeatureCard';

export const HeroSection = () => {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center
        bg-gradient-to-b from-amber-50 to-white px-4"
    >
      <div className="text-center max-w-2xl">
        <p className="text-amber-600 font-medium mb-2 mt-10">완벽한 독서 경험</p>
        <h1 className="text-6xl font-bold text-gray-900 mb-4 mt-5">완독이</h1>
        <p className="text-lg text-gray-600 mb-15 mt-5">
          글을 읽는 새로운 방법
        </p>
        <WelcomeCard />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-26 max-w-4xl">
        <FeatureCard
          emoji="👁️"
          title="포커스 모드"
          description="읽고 있는 문장만 선명하게, 나머지는 흐리게"
        />
        <FeatureCard
          emoji="✂️"
          title="문단 분리"
          description="긴 문단을 클릭 한 번으로 나누기"
        />
        <FeatureCard
          emoji="📊"
          title="진행률 바"
          description="읽기 진행 상황을 한눈에 확인"
        />
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm mb-2 mt-35">↓</p>
        <p className="text-amber-600 font-medium mb-35">
          확장 프로그램을 실행한 뒤 스크롤을 해보세요!
        </p>
      </div>
    </section>
  );
};
