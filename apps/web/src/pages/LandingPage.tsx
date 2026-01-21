/* eslint-disable @stylistic/indent */
import { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

function InteractiveDemo({ isDarkMode }: { isDarkMode: boolean }) {
  const [paragraphs, setParagraphs] = useState([
    [
      '완독이는 웹 독서 경험을 혁신합니다.',
      '마우스를 올리면 해당 문장에 집중할 수 있습니다.',
      '다른 내용은 자연스럽게 흐려져 독서에 방해되지 않습니다.',
      '문장을 클릭하면 문단이 분리됩니다.',
      '이를 통해 원하는 부분만 따로 관리할 수 있습니다.',
      '독서 흐름을 자유롭게 조절하세요.',
      '우측의 진행률 바로 독서 진행도를 확인하세요.',
      '스크롤에 따라 실시간으로 업데이트됩니다.',
      '독서 목표 달성을 한눈에 파악할 수 있습니다.',
      '문단의 마지막 문장을 클릭하면 다음 문단과 병합됩니다.',
      '이 기능으로 분리된 문단을 다시 합칠 수 있습니다.',
      '자유롭게 분리하고 병합하면서 원하는 구조를 만드세요.',
      '크롬 익스텐션을 설치하면 모든 웹페이지에서 사용 가능합니다.',
      '블로그, 뉴스, 문서 등 어디서나 집중 독서 모드를 활성화하세요.',
      '생산성이 향상되는 경험을 느껴보세요.',
      '이 데모를 스크롤하면서 우측 진행률 바를 확인해보세요.',
      '실제 익스텐션에서도 동일하게 작동합니다.',
      '독서 진행도를 시각적으로 파악할 수 있습니다.',
    ],
  ]);

  const [hoveredSentence, setHoveredSentence] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(35);

  const handleToggleParagraph = (
    paragraphIndex: number,
    sentenceIndex: number
  ) => {
    setParagraphs((prev) => {
      const newParagraphs = [...prev];
      const targetParagraph = newParagraphs[paragraphIndex];

      if (sentenceIndex === targetParagraph.length - 1) {
        const nextParagraph = newParagraphs[paragraphIndex + 1];
        if (nextParagraph) {
          const mergedParagraph = [...targetParagraph, ...nextParagraph];
          const result = [
            ...newParagraphs.slice(0, paragraphIndex),
            mergedParagraph,
            ...newParagraphs.slice(paragraphIndex + 2),
          ];
          return result;
        }
      }

      const beforeSentences = targetParagraph.slice(0, sentenceIndex + 1);
      const afterSentences = targetParagraph.slice(sentenceIndex + 1);

      if (afterSentences.length === 0) {
        return prev;
      }

      const result = [
        ...newParagraphs.slice(0, paragraphIndex),
        beforeSentences,
        afterSentences,
        ...newParagraphs.slice(paragraphIndex + 1),
      ];

      return result;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage =
      (element.scrollTop / (element.scrollHeight - element.clientHeight)) *
      100;
    setScrollProgress(Math.min(100, Math.max(0, scrollPercentage)));
  };

  return (
    <div className="relative">
      <div
        className={`
          rounded-lg p-6 transition-colors duration-300 relative
          ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}
        `}
      >
        <div className="mb-4 flex items-center gap-2">
          <div
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}
            `}
          >
            ✨ 체험해보세요
          </div>
        </div>

        <p
          className={`
            text-xs mb-4 transition-colors duration-300
            ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
          `}
        >
          💡 마우스 올리기: 강조 | 클릭: 분리/병합
        </p>

        <div
          className="relative pr-8"
          style={{ height: '400px', overflow: 'hidden' }}
        >
          <div
            className="pr-2"
            style={{
              height: '100%',
              overflowY: 'scroll',
              overflowX: 'hidden',
            }}
            onScroll={handleScroll}
          >
            <div className="space-y-4">
              {paragraphs.map((paragraph, pIndex) => (
                <div
                  key={`${pIndex}-${paragraph.join('')}`}
                  className={`
                    transition-all duration-300 p-3 rounded
                    ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                  `}
                >
                  {paragraph.map((sentence, sIndex) => {
                    const sentenceId = `${pIndex}-${sIndex}`;
                    const isHovered = hoveredSentence === sentenceId;
                    const isOtherHovered =
                      hoveredSentence !== null && !isHovered;

                    return (
                      <span
                        key={sentenceId}
                        className={`
                          inline cursor-pointer transition-all duration-200
                          ${isHovered ? 'font-semibold' : ''}
                          ${isOtherHovered ? 'opacity-30 blur-[1px]' : 'opacity-100'}
                          ${isDarkMode
                            ? 'text-gray-200 hover:text-white'
                            : 'text-gray-800 hover:text-black'
                          }
                        `}
                        onMouseEnter={() => setHoveredSentence(sentenceId)}
                        onMouseLeave={() => setHoveredSentence(null)}
                        onClick={() => handleToggleParagraph(pIndex, sIndex)}
                      >
                        {sentence}{' '}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`
              absolute top-0 right-0 w-2 rounded-full overflow-hidden
              ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}
            `}
            style={{ height: '100%' }}
          >
            <div
              className="w-full bg-amber-500 transition-all duration-200"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3">
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full flex items-center
                justify-center text-xs font-bold
                ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-600'}
              `}
            >
              1
            </div>
            <div>
              <p
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                포커스 모드
              </p>
              <p
                className={`
                  text-xs transition-colors duration-300
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                마우스 호버 시 해당 문장만 강조
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full flex items-center
                justify-center text-xs font-bold
                ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'}
              `}
            >
              2
            </div>
            <div>
              <p
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                문단 분리
              </p>
              <p
                className={`
                  text-xs transition-colors duration-300
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                문장 클릭으로 문단을 자유롭게 분리
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full flex items-center
                justify-center text-xs font-bold
                ${isDarkMode ? 'bg-amber-900 text-amber-300' : 'bg-amber-100 text-amber-600'}
              `}
            >
              3
            </div>
            <div>
              <p
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}
                `}
              >
                진행률 추적
              </p>
              <p
                className={`
                  text-xs transition-colors duration-300
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                `}
              >
                우측 바로 독서 진행도 실시간 확인
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        // eslint-disable-next-line @stylistic/max-len
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        // eslint-disable-next-line @stylistic/max-len
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        // eslint-disable-next-line @stylistic/max-len
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        // eslint-disable-next-line @stylistic/max-len
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        // eslint-disable-next-line @stylistic/max-len
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}


interface LoginFormProps {
  isDarkMode: boolean;
  onLogin: () => void;
}

function LoginForm({ isDarkMode, onLogin }: LoginFormProps) {
  return (
    <div className="space-y-6">
      <h2
        className={`
          text-2xl font-bold text-center
          transition-colors duration-300
          ${isDarkMode ? 'text-white' : 'text-gray-900'}
        `}
      >
        시작하기
      </h2>
      <p
        className={`
          text-center text-sm transition-colors duration-300
          ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
        `}
      >
        구글 계정으로 간편하게 로그인하세요
      </p>
      <button
        onClick={onLogin}
        className={`
          w-full px-6 py-3 rounded-lg
          transition-all duration-300
          flex items-center justify-center gap-3
          ${isDarkMode
            ? 'bg-gray-700 border border-gray-600'
            : 'bg-white border border-gray-300'
          }
          ${isDarkMode
            ? 'text-gray-200 hover:bg-gray-600'
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <GoogleIcon />
        Sign in with Google
      </button>
    </div>
  );
}

interface UserDashboardProps {
  isDarkMode: boolean;
  userProfile: UserProfile | null;
  onLogout: () => void;
}

function UserDashboard({ isDarkMode, userProfile, onLogout }: UserDashboardProps) {
  return (
    <div className="space-y-6">
      <h2
        className={`
          text-2xl font-bold text-center
          transition-colors duration-300
          ${isDarkMode ? 'text-white' : 'text-gray-900'}
        `}
      >
        환영합니다!
      </h2>

      {userProfile && (
        <div className="flex flex-col items-center space-y-4">
          <img
            src={userProfile.picture}
            alt={userProfile.name}
            className="w-20 h-20 rounded-full"
          />
          <div className="text-center">
            <p
              className={`
                font-semibold transition-colors duration-300
                ${isDarkMode ? 'text-white' : 'text-gray-900'}
              `}
            >
              {userProfile.name}
            </p>
            <p
              className={`
                text-sm transition-colors duration-300
                ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              {userProfile.email}
            </p>
          </div>
        </div>
      )}

      <div
        className={`
          rounded-lg p-4 transition-colors duration-300
          ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}
        `}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p
              className={`
                text-2xl font-bold
                transition-colors duration-300
                ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}
              `}
            >
              12
            </p>
            <p
              className={`
                text-xs transition-colors duration-300
                ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              읽은 문서
            </p>
          </div>
          <div>
            <p
              className={`
                text-2xl font-bold
                transition-colors duration-300
                ${isDarkMode ? 'text-green-400' : 'text-green-600'}
              `}
            >
              3
            </p>
            <p
              className={`
                text-xs transition-colors duration-300
                ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              읽는 중
            </p>
          </div>
          <div>
            <p
              className={`
                text-2xl font-bold
                transition-colors duration-300
                ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}
              `}
            >
              48h
            </p>
            <p
              className={`
                text-xs transition-colors duration-300
                ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              독서 시간
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className={`
          w-full px-6 py-3 rounded-lg
          transition-all duration-300
          ${isDarkMode
            ? 'bg-red-900 hover:bg-red-800'
            : 'bg-red-600 hover:bg-red-700'
          }
          text-white
        `}
      >
        로그아웃
      </button>
    </div>
  );
}

function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // 구글 로그인 (모의 구현)
  const handleGoogleLogin = async () => {
    // console.log('Google login clicked');
    // TODO: chrome.identity API 연동
    // TODO: 백엔드 OAuth callback 호출
    // TODO: 토큰 저장 (chrome.storage)

    // 모의 사용자 데이터
    const mockUser: UserProfile = {
      name: '홍길동',
      email: 'user@example.com',
      picture: 'https://via.placeholder.com/100',
    };

    setUserProfile(mockUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // console.log('Logout clicked');
    // TODO: 토큰 삭제
    setUserProfile(null);
    setIsLoggedIn(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div
      className={`
        min-h-screen transition-colors duration-300
        ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
      `}
    >
      <button
        onClick={toggleDarkMode}
        className={`
          fixed top-6 right-6 p-3 rounded-full shadow-lg
          transition-all duration-300
          ${isDarkMode
            ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
            : 'bg-white text-gray-700 hover:bg-gray-100'
          }
        `}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className={`
                text-sm mb-2 transition-colors duration-300
                ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
              `}
            >
              완벽한 독서 경험
            </p>
            <h1
              className={`
                text-6xl font-bold mb-4 transition-colors duration-300
                ${isDarkMode ? 'text-white' : 'text-black'}
              `}
            >
              완독이
            </h1>
            <p
              className={`
                text-lg transition-colors duration-300
                ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
              `}
            >
              크롬 익스텐션으로 당신의 독서 여정을 추적하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <h2
                className={`
                  text-2xl font-bold mb-6 transition-colors duration-300
                  ${isDarkMode ? 'text-white' : 'text-gray-900'}
                `}
              >
                인터랙티브 데모
              </h2>

              <InteractiveDemo isDarkMode={isDarkMode} />
            </div>

            <div className="flex justify-center">
              <div
                className={`
                  rounded-lg shadow-xl p-8 w-full max-w-md
                  transition-colors duration-300
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                `}
              >
                {!isLoggedIn ? (
                  <LoginForm isDarkMode={isDarkMode} onLogin={handleGoogleLogin} />
                ) : (
                  <UserDashboard
                    isDarkMode={isDarkMode}
                    userProfile={userProfile}
                    onLogout={handleLogout}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
