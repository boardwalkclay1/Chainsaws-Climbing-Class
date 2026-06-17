// ===============================
// SQUIRREL HELPER ENGINE
// ===============================

let squirrelData = null;

const squirrelBtn = document.getElementById("squirrelChatBtn");
const squirrelBox = document.getElementById("squirrelChatBox");
const squirrelMessages = document.getElementById("squirrelMessages");
const squirrelInput = document.getElementById("squirrelInput");

// Load JSON data
fetch("/json/squirrel-data.json")
  .then(res => res.json())
  .then(data => squirrelData = data);

// Toggle chatbox
squirrelBtn.addEventListener("click", () => {
  squirrelBox.style.display =
    squirrelBox.style.display === "none" ? "block" : "none";
});

// Add message to chat
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.style.marginBottom = "8px";
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  squirrelMessages.appendChild(div);
  squirrelMessages.scrollTop = squirrelMessages.scrollHeight;
}

// Squirrel speaks
function squirrelSay(text) {
  addMessage("Helper Squirrel", text);
}

// Handle user input
squirrelInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const text = squirrelInput.value.trim();
    if (!text) return;

    addMessage("You", text);
    squirrelInput.value = "";

    handleIntent(text.toLowerCase());
  }
});

// Intent detection
function handleIntent(text) {
  if (!squirrelData) return;

  if (text.includes("site") || text.includes("website")) {
    return squirrelSay(random(squirrelData.website_info));
  }

  if (text.includes("app")) {
    return squirrelSay(random(squirrelData.app_info));
  }

  if (text.includes("account") || text.includes("login")) {
    return squirrelSay(random(squirrelData.account_setup));
  }

  if (text.includes("install")) {
    return squirrelSay(random(squirrelData.install_app));
  }

  if (text.includes("knot")) {
    return squirrelSay(random(squirrelData.knots));
  }

  if (text.includes("climb") || text.includes("technique")) {
    return squirrelSay(random(squirrelData.climbing_techniques));
  }

  if (text.includes("business")) {
    return squirrelSay(random(squirrelData.business));
  }

  if (text.includes("class")) {
    return squirrelSay(`Here’s the class schedule: <a href="${squirrelData.links.classes}">View Classes</a>`);
  }

  if (text.includes("help")) {
    return squirrelSay(random(squirrelData.intro));
  }

  // Default fallback
  squirrelSay("I’m not sure about that one, but I can help with knots, climbing techniques, business skills, the app, or account setup.");
}

// Random helper
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Auto‑intro after 4 seconds
setTimeout(() => {
  if (squirrelData) squirrelSay(random(squirrelData.intro));
}, 4000);
