chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    colorEnhancementsEnabled: true,
    keepRedPoints: false,
    flexModeEnabled: false // Default is false for Flex Op Iedereen mode
  });
});

chrome.webNavigation.onCompleted.addListener((details) => {
  // Check if Flex Op Iedereen Mode is enabled
  chrome.storage.sync.get("flexModeEnabled", (data) => {
    if (data.flexModeEnabled) { // Only inject if Flex Mode is enabled
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: overrideFetch,
        world: 'MAIN'
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error injecting script:', chrome.runtime.lastError);
        }
      });
    }
  });
}, { url: [{ urlMatches: '.*\\.smartschool\\.be/.*' }] });

function overrideFetch() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);

      if (args[0].includes('/results/api/v1/evaluations/')) {
        const clonedResponse = response.clone();
        let data;

        try {
          data = await clonedResponse.json();
        } catch {
          return response;
        }

        modifyDataRecursively(data);

        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'application/json');

        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        });
      }

      return response;
    } catch {
      return originalFetch.apply(this, args);
    }
  };

  function modifyDataRecursively(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(modifyDataRecursively);
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj.graphic && obj.graphic.color === 'steel') {
            return;
          }
          if (key === 'value' && obj[key] !== 100 && (obj.type === 'percentage' || obj.type === 'text')) {
            obj[key] = 100;
            obj.color = 'olive';
          }
          if (key === 'description' && obj.type === 'percentage') {
            let descriptionParts = obj[key].split('/');
            if (descriptionParts.length === 2) {
              obj[key] = `${descriptionParts[1]}/${descriptionParts[1]}`;
            } else {
              obj[key] = '100%';
            }
          }
          modifyDataRecursively(obj[key]);
        }
      }
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "toggle") {
    chrome.storage.sync.set({ colorEnhancementsEnabled: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "toggleRedPoints") {
    chrome.storage.sync.set({ keepRedPoints: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "toggleFlexMode") {
    chrome.storage.sync.set({ flexModeEnabled: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "getState") {
    chrome.storage.sync.get(["colorEnhancementsEnabled", "keepRedPoints", "flexModeEnabled"], (data) => {
      sendResponse({
        colorEnhancementsEnabled: data.colorEnhancementsEnabled,
        keepRedPoints: data.keepRedPoints,
        flexModeEnabled: data.flexModeEnabled
      });
    });
    return true;
  }
});
