import { useEffect, useState } from 'react';

import type { ExtensionState } from '../types/landingTypes';
import { checkExtensionActive } from '../utils/extensionDetector';

const POLL_INTERVAL = 1000;
const ACTIVATED_EVENT = 'wandok:activated';
const DEACTIVATED_EVENT = 'wandok:deactivated';

/**
 * 익스텐션 활성화 상태를 감지하는 커스텀 훅
 * (이 페이지는 익스텐션 설치 후 열리므로 설치 여부는 확인하지 않음)
 *
 * 활성화 이벤트는 content script가 document에 보낸다.
 * 리스너 등록 전에 이미 켜져 있으면 첫 렌더의 shadow host 검사와 폴링이 보완한다.
 */
export const useExtensionState = () => {
  const [extensionState, setExtensionState] = useState<ExtensionState>(() => (
    checkExtensionActive() ? 'active' : 'inactive'
  ));

  useEffect(() => {
    const checkState = () => {
      setExtensionState(checkExtensionActive() ? 'active' : 'inactive');
    };

    checkState();

    const interval = setInterval(checkState, POLL_INTERVAL);

    const handleActivated = () => {
      setExtensionState('active');
    };

    const handleDeactivated = () => {
      setExtensionState('inactive');
    };

    document.addEventListener(ACTIVATED_EVENT, handleActivated);
    document.addEventListener(DEACTIVATED_EVENT, handleDeactivated);

    return () => {
      clearInterval(interval);
      document.removeEventListener(ACTIVATED_EVENT, handleActivated);
      document.removeEventListener(DEACTIVATED_EVENT, handleDeactivated);
    };
  }, []);

  return extensionState;
};
