const LANDING_PAGE_URL = 'https://wandok-client.vercel.app/';

chrome.runtime.onInstalled.addListener((details) => {
  chrome.action.setBadgeText({
    text: 'OFF',
  });

  // 초기 상태를 OFF로 설정
  chrome.storage.local.set({ wandokEnabled: false });

  if (details.reason === 'install') {
    chrome.tabs.create({ url: LANDING_PAGE_URL });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';
  const isEnabled = nextState === 'ON';

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  // storage에 상태 저장
  await chrome.storage.local.set({ wandokEnabled: isEnabled });
});
