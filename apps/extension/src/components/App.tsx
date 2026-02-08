import { useEffect, useState } from 'react';

import { ProgressBar } from './ProgressBar';

export const App = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // 초기 상태 확인
    chrome.storage.local.get('wandokEnabled', (result: { wandokEnabled?: boolean }) => {
      setIsEnabled(result.wandokEnabled ?? false);
    });

    // 상태 변경 리스닝
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ) => {
      if (areaName === 'local' && changes.wandokEnabled) {
        setIsEnabled((changes.wandokEnabled.newValue as boolean | undefined) ?? false);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  return <ProgressBar />;
};
