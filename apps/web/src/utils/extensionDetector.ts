const SHADOW_HOST_ID = 'wandok-shadow-host';

/**
 * 익스텐션 활성화 여부 확인
 * Shadow Host가 존재하면 활성화된 것으로 판단
 */
export const checkExtensionActive = (): boolean => {
  return !!document.getElementById(SHADOW_HOST_ID);
};
