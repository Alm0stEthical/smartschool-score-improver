document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggleScript");

  chrome.storage.sync.get("colorEnhancementsEnabled", (data) => {
    toggleButton.checked = data.colorEnhancementsEnabled;
  });

  toggleButton.addEventListener("change", () => {
    const isEnabled = toggleButton.checked;
    chrome.runtime.sendMessage({ action: "toggle", enabled: isEnabled });
  });
});

var speed = 80;
var hex = ["00", "14", "28", "3C", "50", "64", "78", "8C", "A0", "B4", "C8", "DC", "F0"];
var r = 0,
  g = 0,
  b = 0;
var seq = 1;

function changeText() {
  var elements = document.getElementsByName("Rainbow");
  for (var i = 0; i < elements.length; i++) {
    var storetext = elements[i];
    storetext.style.color = "#" + hex[r] + hex[g] + hex[b];
  }
}

function change() {
  switch (seq) {
    case 1:
      if (g < 11) g++;
      else seq = 2;
      break;
    case 2:
      if (r > 0) r--;
      else seq = 3;
      break;
    case 3:
      if (b < 11) b++;
      else seq = 4;
      break;
    case 4:
      if (g > 0) g--;
      else seq = 5;
      break;
    case 5:
      if (r < 11) r++;
      else seq = 6;
      break;
    case 6:
      if (b > 0) b--;
      else seq = 1;
      break;
  }
  changeText();
}

function startEffect() {
  if (document.all || document.getElementById) {
    setInterval(change, speed);
  }
}

startEffect();

document.getElementById("toggleScript").addEventListener("change", function () {
  var checkbox = document.getElementById("toggleScript");
  var checkBoxDiv = checkbox.nextElementSibling;
  if (checkbox.checked) {
    checkBoxDiv.classList.remove("gray-btn");
    checkBoxDiv.classList.add("colorful-btn");
  } else {
    checkBoxDiv.classList.remove("colorful-btn");
    checkBoxDiv.classList.add("gray-btn");
  }
});
