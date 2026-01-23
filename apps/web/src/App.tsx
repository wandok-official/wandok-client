import './index.css';

import { useEffect, useState } from 'react';

import LandingPage from './pages/LandingPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // popstate 이벤트 감지 (뒤로가기/앞으로가기)
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // 라우팅
  if (currentPath === '/privacy-policy' || currentPath === '/privacy-policy.html') {
    return <PrivacyPolicyPage />;
  }

  return <LandingPage />;
}

export default App;
