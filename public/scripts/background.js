chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    colorEnhancementsEnabled: true,
    keepRedPoints: false,
    flexModeEnabled: false,
    realismModeEnabled: false,
  });
});

// Retry injection with exponential backoff
function injectScriptWithRetry(tabId, maxRetries = 3, delay = 100) {
  let attempts = 0;

  const tryInject = () => {
    attempts++;
    chrome.storage.sync.get(["flexModeEnabled", "realismModeEnabled"], (data) => {
      if (data.flexModeEnabled || data.realismModeEnabled) {
        // Check if tab still exists before injecting
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            console.log("[Score Improver Background] Tab no longer exists, skipping injection");
            return;
          }

          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              func: overrideFetch,
              args: [data.realismModeEnabled],
              world: "MAIN",
            },
            () => {
              if (chrome.runtime.lastError) {
                console.error(
                  `[Score Improver Background] Injection attempt ${attempts} failed:`,
                  chrome.runtime.lastError.message
                );
                if (attempts < maxRetries) {
                  setTimeout(tryInject, delay * attempts);
                }
              } else {
                console.log(`[Score Improver Background] Script injected successfully on attempt ${attempts}, realismMode=${data.realismModeEnabled}`);
              }
            }
          );
        });
      }
    });
  };

  tryInject();
}

// INJECT ASAP!!!!!! 
chrome.webNavigation.onCommitted.addListener(
  (details) => {
    if (details.frameId === 0) {
      // Inject immediately without delay is this ok? idk 
      injectScriptWithRetry(details.tabId);
    }
  },
  { url: [{ urlMatches: ".*\\.smartschool\\.be/.*" }] }
);

// edge cases are gay, but here i am...
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.frameId === 0) {
      // if god didnt allow we need to FORCE inject agian lol
      injectScriptWithRetry(details.tabId);
    }
  },
  { url: [{ urlMatches: ".*\\.smartschool\\.be/.*" }] }
);

// SPA nav?> TBC?
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    if (details.frameId === 0) {
      injectScriptWithRetry(details.tabId);
    }
  },
  { url: [{ urlMatches: ".*\\.smartschool\\.be/.*" }] }
);

function overrideFetch(realismMode = false) {
  if (window.__smartschoolScoreImproverInjected) {
    console.log("[Score Improver] Already injected, skipping");
    return;
  }
  window.__smartschoolScoreImproverInjected = true;

  console.log(`[Score Improver] Injecting fetch override - Realism Mode: ${realismMode}`);

  const originalFetch = window.fetch;

  function getRandomScore() {
    return Math.floor(Math.random() * 21) + 80;
  }

  window.fetch = async function (...args) {
    try {
      const response = await originalFetch.apply(this, args);

      if (args[0].includes("/results/api/v1/evaluations/")) {
        console.log(`[Score Improver] Intercepted API call: ${args[0]}`);
        const clonedResponse = response.clone();
        let data;

        try {
          data = await clonedResponse.json();
        } catch {
          console.log("[Score Improver] Failed to parse JSON");
          return response;
        }

        modifyDataRecursively(data);
        console.log("[Score Improver] Modified data successfully");

        const headers = new Headers(response.headers);
        headers.set("Content-Type", "application/json");

        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
      }

      return response;
    } catch (error) {
      console.error("[Score Improver] Error in fetch override:", error);
      return originalFetch.apply(this, args);
    }
  };

  function modifyDataRecursively(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(modifyDataRecursively);
    } else if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj.graphic && obj.graphic.color === "steel") {
            return;
          }

          // FIRST OF ALL: proces description to calculate the correct score
          if (key === "description" && obj.type === "percentage") {
            let descriptionParts = obj[key].split("/");

            if (descriptionParts.length === 2) {
              // Format is "X/Y" (e.g., "3/5") - GPA was better
              const maxScore = parseInt(descriptionParts[1]);
              const minScore = Math.ceil(maxScore * 0.8); // 80% of max, rounded up

              if (realismMode) {
                // REALISM MODE: Generate random score between 80-100% of max
                const randomScore = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
                obj[key] = `${randomScore}/${maxScore}`;

                // Calculate EXACT percentage from this score
                const exactPercentage = Math.round((randomScore / maxScore) * 100);
                obj.value = exactPercentage;

                // Set color based on percentage
                if (exactPercentage >= 90) {
                  obj.color = "olive"; // Dark green for 90-100%
                } else if (exactPercentage >= 80) {
                  obj.color = "green"; // Green for 80-89%
                }

                console.log(`[Score Improver] Realism mode: ${descriptionParts[0]}/${maxScore} -> ${randomScore}/${maxScore} (${exactPercentage}%) color: ${obj.color}`);
              } else {
                // 100% MODE: Set to max/max (e.g., "5/5")
                obj[key] = `${maxScore}/${maxScore}`;
                obj.value = 100;
                obj.color = "olive"; // Change color to green
                console.log(`[Score Improver] 100% mode: ${descriptionParts[0]}/${maxScore} -> ${maxScore}/${maxScore}`);
              }
            } else {
              // Format is just "X%" (e.g., "60%")
              // als je dit leest is Tim de Rocker goated
              if (realismMode) {
                // REALISM MODE: Random percentage 80-100
                const randomPercentage = getRandomScore();
                obj.value = randomPercentage;
                obj[key] = `${randomPercentage}%`;

                // Set color based on percentage
                if (randomPercentage >= 90) {
                  obj.color = "olive"; // Dark green for 90-100%
                } else if (randomPercentage >= 80) {
                  obj.color = "green"; // Green for 80-89%
                }

                console.log(`[Score Improver] Realism mode: ${descriptionParts[0]} -> ${randomPercentage}% color: ${obj.color}`);
              } else {
                // 100% MODE: Show "100%"
                obj.value = 100;
                obj[key] = "100%";
                obj.color = "olive";
                console.log(`[Score Improver] 100% mode: ${descriptionParts[0]} -> 100%`);
              }
            }
          }

          // SECOND: Handle items that only have value without description
          if (
            key === "value" &&
            obj[key] !== 100 &&
            (obj.type === "percentage" || obj.type === "text") &&
            !obj.description
          ) {
            const originalValue = obj[key];

            if (realismMode) {
              // REALISM MODE: Set to random 80-100%
              obj[key] = getRandomScore();

              if (obj[key] >= 90) {
                obj.color = "olive"; // Dark green fo 90-100
              } else if (obj[key] >= 80) {
                obj.color = "green";
              }

              console.log(`[Score Improver] Realism mode (no description): ${originalValue}% -> ${obj[key]}% color: ${obj.color}`);
            } else {
              // 100% MODE: Set to 100%
              obj[key] = 100;
              obj.color = "olive";
              console.log(`[Score Improver] 100% mode (no description): ${originalValue}% -> 100%`);
            }
          }

          modifyDataRecursively(obj[key]);
        }
      }
    }
  }
}

// snap ier niks meer van, bloaded, fix ASAP
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
  } else if (message.action === "toggleRealismMode") {
    chrome.storage.sync.set({ realismModeEnabled: message.enabled });
    sendResponse({ status: "success" });
  } else if (message.action === "getState") {
    chrome.storage.sync.get(
      ["colorEnhancementsEnabled", "keepRedPoints", "flexModeEnabled", "realismModeEnabled"],
      (data) => {
        sendResponse({
          colorEnhancementsEnabled: data.colorEnhancementsEnabled,
          keepRedPoints: data.keepRedPoints,
          flexModeEnabled: data.flexModeEnabled,
          realismModeEnabled: data.realismModeEnabled,
        });
      }
    );
    return true;
  }
});
