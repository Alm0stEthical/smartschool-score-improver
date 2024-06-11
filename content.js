const colorMap = {
  yellow: {
    old: ["var(--c-yellow--500)", "var(--c-yellow--200)", "c-yellow-combo--100", "smsc-svg--message_feedback_yellow--16", "var(--c-yellow--700);", "c-yellow-combo--200", "--feedback-color: var(--c-yellow--700);"],
    new: ["var(--c-green--500)", "var(--c-green--200)", "c-green-combo--100", "smsc-svg--message_feedback_green--16", "var(--c-green--700);", "c-green-combo--200", "--feedback-color: var(--c-green--700);"],
  },
  tangerine: {
    old: ["var(--c-tangerine--500)", "var(--c-tangerine--200)", "c-tangerine-combo--100", "smsc-svg--message_feedback_tangerine--16", "var(--c-tangerine--700);", "c-tangerine-combo--200", "--feedback-color: var(--c-tangerine--700);"],
    new: ["var(--c-green--500)", "var(--c-green--200)", "c-green-combo--100", "smsc-svg--message_feedback_green--16", "var(--c-green--700);", "c-green-combo--200", "--feedback-color: var(--c-green--700);"],
  },
  red: {
    old: ["var(--c-red--500)", "var(--c-red--200)", "c-red-combo--100", "smsc-svg--message_feedback_red--16", "var(--c-red--700);", "c-red-combo--200", "--feedback-color: var(--c-red--700);"],
    new: ["var(--c-black--500)", "var(--c-black--200)", "c-black-combo--100", "smsc-svg--message_feedback_black--16", "var(--c-black--700);", "c-black-combo--200", "--feedback-color: var(--c-black--700);"],
  },
};

const colorProperties = {
  green: {
    100: "#eafcea",
    200: "#bcf6bc",
    300: "#8fed90",
    400: "#64e266",
    500: "#3bd63d",
    600: "#2eb42f",
    700: "#219023",
    800: "#176b18",
    900: "#0d450e",
  },
  black: {
    100: "#e9e9e9",
    200: "#b9b9b9",
    300: "#888",
    400: "#585858",
    500: "#272727",
    600: "#222",
    700: "#1d1d1d",
    800: "#181818",
    900: "#141414",
  },
};

Object.entries(colorProperties).forEach(([color, shades]) => {
  Object.entries(shades).forEach(([shade, value]) => {
    document.documentElement.style.setProperty(`--c-${color}--${shade}`, value);
  });
});

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

setInterval(() => {
  const allElements = document.querySelectorAll("div, button, circle");

  allElements.forEach((element) => {
    replaceProperties(element, colorMap.yellow.old, colorMap.yellow.new);
    replaceProperties(element, colorMap.tangerine.old, colorMap.tangerine.new);
    replaceProperties(element, colorMap.red.old, colorMap.red.new);
  });
}, 0.01);
