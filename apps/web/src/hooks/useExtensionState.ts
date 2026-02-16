import { useEffect,useState } from 'react';

import type { ExtensionState } from '../types/landingTypes';
import { checkExtensionActive } from '../utils/extensionDetector';

const POLL_INTERVAL = 1000;

/**
 * 익스텐션 활성화 상태를 감지하는 커스텀 훅
 * (이 페이지는 익스텐션 설치 후 열리므로 설치 여부는 확인하지 않음)
 */
export const useExtensionState = () => {
  const [extensionState, setExtensionState] = useState<ExtensionState>('inactive');

  useEffect(() => {
    const checkState = () => {
      if (checkExtensionActive()) {
        setExtensionState('active');
      }
    };

    // 초기 상태 확인
    checkState();

    // 주기적으로 상태 확인
    const interval = setInterval(checkState, POLL_INTERVAL);

    // 익스텐션 활성화 이벤트 리스너
    const handleActivated = () => {
      setExtensionState('active');
    };

    window.addEventListener('wandok:activated', handleActivated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('wandok:activated', handleActivated);
    };
  }, []);

  return extensionState;
};
