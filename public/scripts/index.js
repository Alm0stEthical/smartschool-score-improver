const colors = {
  yellow: "yellow",
  tangerine: "tangerine",
  red: "red",
  green: "green",
  black: "black",
};

const colorData = {
  [colors.yellow]: {
    mappings: createMappings(colors.yellow, colors.green),
  },
  [colors.tangerine]: {
    mappings: createMappings(colors.tangerine, colors.green),
  },
  [colors.red]: {
    mappings: createMappings(colors.red, colors.black),
  },
};

function createMappings(oldColor, newColor) {
  return {
    old: [
      `smsc-svg--message_feedback_${oldColor}--16`,
      `c-${oldColor}-combo--100`,
      `c-${oldColor}-combo--200`,
      `var(--c-${oldColor}--500)`,
      `var(--c-${oldColor}--200)`,
      `var(--c-${oldColor}--700);`,
      `--feedback-color: var(--c-${oldColor}--700);`,
    ],
    new: [
      `smsc-svg--message_feedback_${newColor}--16`,
      `c-${newColor}-combo--100`,
      `c-${newColor}-combo--200`,
      `var(--c-${newColor}--500)`,
      `var(--c-${newColor}--200)`,
      `var(--c-${newColor}--700);`,
      `--feedback-color: var(--c-${newColor}--700);`,
    ],
  };
}

const replaceProperties = (element, oldProps, newProps) => {
  oldProps.forEach((oldProp, index) => {
    const newProp = newProps[index];
    if (element.classList.contains(oldProp)) {
      element.classList.replace(oldProp, newProp);
    }
    if (element.style.cssText.includes(oldProp)) {
      element.style.cssText = element.style.cssText.replaceAll(
        oldProp,
        newProp
      );
    }
    if (element.style.stroke === oldProp) {
      element.style.stroke = newProp;
    }
  });
};

const applyColorEnhancements = (keepRedPoints) => {
  const allElements = document.querySelectorAll("div, button, circle");

  Object.entries(colorData).forEach(([color, data]) => {
    if (data.mappings) {
      const { old, new: newProps } = data.mappings;
      if (color !== colors.red || !keepRedPoints) {
        allElements.forEach((element) => {
          replaceProperties(element, old, newProps);
        });
      }
    }
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "applyColorEnhancements") {
    chrome.storage.sync.get("keepRedPoints", (data) => {
      applyColorEnhancements(data.keepRedPoints);
    });
  } else if (message.action === "toggle") {
    chrome.storage.sync.set(
      { colorEnhancementsEnabled: message.enabled },
      () => {
        if (message.enabled) {
          chrome.storage.sync.get("keepRedPoints", (data) => {
            applyColorEnhancements(data.keepRedPoints);
          });
        } else {
          location.reload();
        }
      }
    );
  } else if (message.action === "toggleRedPoints") {
    chrome.storage.sync.set({ keepRedPoints: message.enabled }, () => {
      chrome.storage.sync.get("colorEnhancementsEnabled", (data) => {
        if (data.colorEnhancementsEnabled) {
          applyColorEnhancements(message.enabled);
        }
      });
    });
  } else if (message.action === "toggleFlexMode") {
    chrome.storage.sync.set({ flexModeEnabled: message.enabled }, () => {});
  }
});

chrome.storage.sync.get(
  ["colorEnhancementsEnabled", "keepRedPoints", "flexModeEnabled"],
  (data) => {
    if (data.colorEnhancementsEnabled === undefined) {
      chrome.storage.sync.set({
        colorEnhancementsEnabled: true,
        keepRedPoints: false,
        flexModeEnabled: false,
      });
      applyColorEnhancements(false);
      setInterval(() => applyColorEnhancements(false), 1);
    } else if (data.flexModeEnabled) {
    } else if (data.colorEnhancementsEnabled) {
      applyColorEnhancements(data.keepRedPoints);
      setInterval(() => applyColorEnhancements(data.keepRedPoints), 1);
    }
  }
);

document.addEventListener("DOMContentLoaded", () => {
  const toggleScript = document.getElementById("toggleScript");
  const toggleRedPoints = document.getElementById("toggleRedPoints");
  const toggleFlexMode = document.getElementById("toggleFlexMode");

  if (toggleScript && toggleRedPoints && toggleFlexMode) {
    chrome.storage.sync.get(
      ["colorEnhancementsEnabled", "keepRedPoints", "flexModeEnabled"],
      (data) => {
        toggleScript.checked = data.colorEnhancementsEnabled;
        toggleRedPoints.checked = data.keepRedPoints;
        toggleFlexMode.checked = data.flexModeEnabled;

        if (data.flexModeEnabled) {
          toggleScript.disabled = true;
          toggleRedPoints.disabled = true;
        }
      }
    );

    toggleScript.addEventListener("change", () => {
      const isEnabled = toggleScript.checked;
      chrome.runtime.sendMessage({ action: "toggle", enabled: isEnabled });
    });

    toggleRedPoints.addEventListener("change", () => {
      const isEnabled = toggleRedPoints.checked;
      chrome.runtime.sendMessage({
        action: "toggleRedPoints",
        enabled: isEnabled,
      });
    });

    toggleFlexMode.addEventListener("change", () => {
      const isEnabled = toggleFlexMode.checked;
      chrome.storage.sync.set({ flexModeEnabled: isEnabled });

      if (isEnabled) {
        toggleScript.disabled = true;
        toggleRedPoints.disabled = true;
        toggleScript.checked = false;
        toggleRedPoints.checked = false;

        chrome.runtime.sendMessage({ action: "toggle", enabled: false });
        chrome.runtime.sendMessage({
          action: "toggleRedPoints",
          enabled: false,
        });
      } else {
        toggleScript.disabled = false;
        toggleRedPoints.disabled = false;
      }
    });
  }
});
