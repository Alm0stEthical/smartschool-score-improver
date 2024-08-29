chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    colorEnhancementsEnabled: true,
    keepRedPoints: false
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    chrome.storage.sync.set({ colorEnhancementsEnabled: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "toggleRedPoints") {
    chrome.storage.sync.set({ keepRedPoints: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "getState") {
    chrome.storage.sync.get(["colorEnhancementsEnabled", "keepRedPoints"], (data) => {
      sendResponse({
        colorEnhancementsEnabled: data.colorEnhancementsEnabled,
        keepRedPoints: data.keepRedPoints
      });
    });
    return true;
  }
});