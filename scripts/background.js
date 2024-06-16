chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ colorEnhancementsEnabled: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    chrome.storage.sync.set({ colorEnhancementsEnabled: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "getState") {
    chrome.storage.sync.get("colorEnhancementsEnabled", (data) => {
      sendResponse({ enabled: data.colorEnhancementsEnabled });
    });
    return true;
  }
});
