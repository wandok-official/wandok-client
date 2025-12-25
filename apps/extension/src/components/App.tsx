import { useState } from 'react';
import { ProgressBar } from './ProgressBar';
import { TextHighlightManager } from './TextHighlightManager';
import { Toast } from './Toast';

export const App = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleHighlightError = () => {
    setToastMessage('동일한 종류의 텍스트만 하이라이트 가능합니다');
  };

  return (
    <>
      <ProgressBar />
      <TextHighlightManager onHighlightError={handleHighlightError} />
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
    </>
  );
};
