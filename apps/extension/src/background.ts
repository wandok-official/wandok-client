const LANDING_PAGE_URL = 'https://www.wandok.site/';
const BADGE_ON = 'ON';
const BADGE_OFF = 'OFF';

chrome.runtime.onInstalled.addListener((details) => {
  // update / chrome_update에서도 이 리스너가 호출된다.
  // 설치 시에만 초기화해야 사용자의 ON/OFF가 업데이트마다 꺼지지 않는다.
  if (details.reason !== 'install') return;

  chrome.action.setBadgeText({
    text: BADGE_OFF,
  });

  chrome.storage.local.set({ wandokEnabled: false });
  chrome.tabs.create({ url: LANDING_PAGE_URL });
});

// 탭 로딩 완료 시 badge 상태를 storage와 동기화
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return;

  return syncBadgeFromStorage(tabId).catch(() => undefined);
});

const syncBadgeFromStorage = async (tabId: number) => {
  const { wandokEnabled } = await chrome.storage.local.get('wandokEnabled');
  await chrome.action.setBadgeText({
    tabId,
    text: wandokEnabled ? BADGE_ON : BADGE_OFF,
  });
};

const applyBadgeText = async (text: string, clickedTabId: number) => {
  // tabId 없는 값은 기본 배지다. 탭별 값이 이미 있으면 기본값만으로는 안 바뀐다.
  await chrome.action.setBadgeText({ text });

  const tabs = await chrome.tabs.query({});
  const tabIds = new Set<number>([clickedTabId]);

  tabs.forEach((openTab) => {
    if (openTab.id !== undefined) {
      tabIds.add(openTab.id);
    }
  });

  await Promise.all(
    [...tabIds].map((tabId) => chrome.action.setBadgeText({ tabId, text })),
  );
};

const handleActionClick = async (tab: { id?: number }) => {
  if (!tab.id) return;

  // 배지 문구가 아니라 storage가 전 탭 공통 상태다.
  // 다른 탭에 남은 OFF 배지를 기준으로 토글하면 한 번 더 눌러야 꺼진다.
  const { wandokEnabled } = await chrome.storage.local.get('wandokEnabled');
  const isEnabled = wandokEnabled !== true;

  await chrome.storage.local.set({ wandokEnabled: isEnabled });
  await applyBadgeText(isEnabled ? BADGE_ON : BADGE_OFF, tab.id);
};

// 클릭을 겹치면 둘 다 같은 값을 읽고 마지막 쓰기가 토글을 삼킨다.
let clickQueue: Promise<void> = Promise.resolve();

chrome.action.onClicked.addListener((tab) => {
  const task = clickQueue.then(() => handleActionClick(tab));
  clickQueue = task.then(() => undefined, () => undefined);
  return task;
});

export {};
