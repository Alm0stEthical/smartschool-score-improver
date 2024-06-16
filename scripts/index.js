const colorData = {
  yellow: {
    mappings: {
      old: [
        "smsc-svg--message_feedback_yellow--16",
        "c-yellow-combo--100",
        "c-yellow-combo--200",
        "var(--c-yellow--500)",
        "var(--c-yellow--200)",
        "var(--c-yellow--700);",
        "--feedback-color: var(--c-yellow--700);",
      ],
      new: [
        "smsc-svg--message_feedback_green--16",
        "c-green-combo--100",
        "c-green-combo--200",
        "var(--c-green--500)",
        "var(--c-green--200)",
        "var(--c-green--700);",
        "--feedback-color: var(--c-green--700);",
      ],
    },
  },
  tangerine: {
    mappings: {
      old: [
        "smsc-svg--message_feedback_tangerine--16",
        "c-tangerine-combo--100",
        "c-tangerine-combo--200",
        "var(--c-tangerine--500)",
        "var(--c-tangerine--200)",
        "var(--c-tangerine--700);",
        "--feedback-color: var(--c-tangerine--700);",
      ],
      new: [
        "smsc-svg--message_feedback_green--16",
        "c-green-combo--100",
        "c-green-combo--200",
        "var(--c-green--500)",
        "var(--c-green--200)",
        "var(--c-green--700);",
        "--feedback-color: var(--c-green--700);",
      ],
    },
  },
  red: {
    mappings: {
      old: [
        "smsc-svg--message_feedback_red--16",
        "c-red-combo--100",
        "c-red-combo--200",
        "var(--c-red--500)",
        "var(--c-red--200)",
        "var(--c-red--700);",
        "--feedback-color: var(--c-red--700);",
      ],
      new: [
        "smsc-svg--message_feedback_black--16",
        "c-black-combo--100",
        "c-black-combo--200",
        "var(--c-black--500)",
        "var(--c-black--200)",
        "var(--c-black--700);",
        "--feedback-color: var(--c-black--700);",
      ],
    },
  },
};

const replaceProperties = (element, oldProps, newProps) => {
  oldProps.forEach((oldProp, index) => {
    const newProp = newProps[index];
    if (element.classList.contains(oldProp)) {
      element.classList.replace(oldProp, newProp);
    }
    if (element.style.cssText.includes(oldProp)) {
      element.style.cssText = element.style.cssText.replaceAll(oldProp, newProp);
    }
    if (element.style.stroke === oldProp) {
      element.style.stroke = newProp;
    }
  });
};

const applyColorEnhancements = () => {
  const allElements = document.querySelectorAll("div, button, circle");

  Object.entries(colorData).forEach(([color, data]) => {
    if (data.mappings) {
      const { old, new: newProps } = data.mappings;
      allElements.forEach((element) => {
        replaceProperties(element, old, newProps);
      });
    }
  });
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "applyColorEnhancements") {
    applyColorEnhancements();
  }
});

chrome.storage.sync.get("colorEnhancementsEnabled", (data) => {
  if (data.colorEnhancementsEnabled) {
    applyColorEnhancements();
    setInterval(applyColorEnhancements, 1);
  }
});
