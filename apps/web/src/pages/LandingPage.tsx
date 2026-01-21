/* eslint-disable @stylistic/indent */
import { useState } from 'react';
import GoogleIcon from '../components/icons/GoogleIcon';
import SunIcon from '../components/icons/SunIcon';
import MoonIcon from '../components/icons/MoonIcon';
import InteractiveDemo from '../components/InteractiveDemo';

interface UserProfile {
  name: string;
  email: string;
  picture: string;
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
