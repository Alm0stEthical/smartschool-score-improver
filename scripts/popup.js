document.addEventListener("DOMContentLoaded", () => {
  const toggleScript = document.getElementById("toggleScript");
  const toggleRedPoints = document.getElementById("toggleRedPoints");
  const toggleFlexMode = document.getElementById("toggleFlexMode");

  // Load saved settings from chrome.storage
  chrome.storage.sync.get(["colorEnhancementsEnabled", "keepRedPoints", "flexModeEnabled"], (data) => {
    toggleScript.checked = data.colorEnhancementsEnabled;
    toggleRedPoints.checked = data.keepRedPoints;
    toggleFlexMode.checked = data.flexModeEnabled;

    // Disable other toggles if Flex Mode is enabled
    if (data.flexModeEnabled) {
      toggleScript.disabled = true;
      toggleRedPoints.disabled = true;
    }
  });

  // Toggle for "Score Improver"
  toggleScript.addEventListener("change", () => {
    const isEnabled = toggleScript.checked;
    chrome.runtime.sendMessage({ action: "toggle", enabled: isEnabled });
  });

  // Toggle for "Keep Red Points"
  toggleRedPoints.addEventListener("change", () => {
    const isEnabled = toggleRedPoints.checked;
    chrome.runtime.sendMessage({ action: "toggleRedPoints", enabled: isEnabled });
  });

  // Toggle for "Flex Op Iedereen Mode"
  toggleFlexMode.addEventListener("change", () => {
    const isEnabled = toggleFlexMode.checked;
    chrome.storage.sync.set({ flexModeEnabled: isEnabled });

    // If Flex Mode is enabled, disable other toggles
    if (isEnabled) {
      toggleScript.disabled = true;
      toggleRedPoints.disabled = true;
      toggleScript.checked = false;
      toggleRedPoints.checked = false;

      // Disable other settings in chrome storage
      chrome.runtime.sendMessage({ action: "toggle", enabled: false });
      chrome.runtime.sendMessage({ action: "toggleRedPoints", enabled: false });
    } else {
      toggleScript.disabled = false;
      toggleRedPoints.disabled = false;
    }
  });
});
