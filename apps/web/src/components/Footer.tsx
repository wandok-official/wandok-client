/**
 * 푸터 컴포넌트
 * 완독이 로고와 Privacy Policy 링크 포함
 */
export function Footer() {
  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState({}, '', '/privacy-policy');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <footer className="w-full bg-white border-t border-gray-200 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* 로고 */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">완독이</span>
            <span className="text-sm text-gray-500">Wandok</span>
          </div>

          {/* 링크 */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="/privacy-policy"
              onClick={handlePrivacyClick}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              개인정보 처리방침
            </a>
            <span className="text-gray-300">•</span>
            <a
              href="https://github.com/wandok-official/wandok-client"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              GitHub
            </a>
          </div>

          {/* 저작권 */}
          <div className="text-xs text-gray-500">
            © 2026 Wandok. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
