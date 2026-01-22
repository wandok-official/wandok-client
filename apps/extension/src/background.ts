// TODO: 배포 후 실제 랜딩 페이지 URL로 변경 필요
const LANDING_PAGE_URL = 'http://localhost:5173';

chrome.runtime.onInstalled.addListener((details) => {
  chrome.action.setBadgeText({
    text: 'OFF',
  });

  if (details.reason === 'install') {
    chrome.tabs.create({ url: LANDING_PAGE_URL });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === 'ON' ? 'OFF' : 'ON';

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  if (nextState === 'ON') {
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['content.css'],
    });

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
  } else {
    chrome.tabs.reload(tab.id);
  }
});
