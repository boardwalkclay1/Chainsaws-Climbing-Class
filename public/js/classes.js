// ===============================
// CLASS SCHEDULE + SIGNUP LOGIC
// ===============================

// Simple in-memory demo data.
// In production, you’ll fetch this from your Cloudflare Worker (D1-backed).
const demoClasses = [
  {
    id: "cls-1",
    date: "2026-06-20",
    time: "10:00 AM",
    type: "group",
    title: "Beginner Group Climbing Class",
    price: 80,
    spots: 8
  },
  {
    id: "cls-2",
    date: "2026-06-20",
    time: "2:00 PM",
    type: "personal",
    title: "1-on-1 Advanced Climbing Session",
    price: 200,
    spots: 1
  },
  {
    id: "cls-3",
    date: "2026-06-22",
    time: "9:00 AM",
    type: "group",
    title: "Gear, Knots & Safety Group Class",
    price: 80,
    spots: 10
  },
  {
    id: "cls-4",
    date: "2026-06-25",
    time: "1:00 PM",
    type: "personal",
    title: "1-on-1 Rigging & Jobsite Flow",
    price: 200,
    spots: 1
  }
];

let selectedDate = null;
let selectedClassId = null;

// DOM refs
const calendarHeader = document.getElementById("calendarHeader");
const calendarGrid = document.getElementById("calendarGrid");
const classesList = document.getElementById("classesList");
const selectedClassLabel = document.getElementById("selectedClassLabel");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupType = document.getElementById("signupType");
const signupSubmit = document.getElementById("signupSubmit");
const signupStatus = document.getElementById("signupStatus");

// Build calendar for current month
function buildCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay(); // 0=Sun
  const totalDays = lastDay.getDate();

  calendarHeader.textContent = `${firstDay.toLocaleString("default", {
    month: "long"
  })} ${year}`;

  calendarGrid.innerHTML = "";

  // Fill blanks before first day
  for (let i = 0; i < startWeekday; i++) {
    const blank = document.createElement("div");
    blank.className = "calendar-day";
    blank.style.visibility = "hidden";
    calendarGrid.appendChild(blank);
  }

  // Fill actual days
  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = dateObj.toISOString().slice(0, 10);

    const dayDiv = document.createElement("div");
    dayDiv.className = "calendar-day";
    dayDiv.textContent = day;

    const hasClass = demoClasses.some(c => c.date === dateStr);
    if (hasClass) {
      dayDiv.classList.add("has-class");
    }

    dayDiv.addEventListener("click", () => {
      selectedDate = dateStr;
      highlightSelectedDay(dayDiv);
      renderClassesForDate(dateStr);
    });

    calendarGrid.appendChild(dayDiv);
  }
}

function highlightSelectedDay(selectedDiv) {
  const allDays = calendarGrid.querySelectorAll(".calendar-day");
  allDays.forEach(d => d.classList.remove("selected"));
  selectedDiv.classList.add("selected");
}

// Render classes for selected date
function renderClassesForDate(dateStr) {
  const classes = demoClasses.filter(c => c.date === dateStr);
  classesList.innerHTML = "";

  if (!classes.length) {
    classesList.innerHTML = "<p>No classes scheduled for this date yet.</p>";
    selectedClassId = null;
    selectedClassLabel.textContent = "No class selected yet.";
    return;
  }

  classes.forEach(cls => {
    const card = document.createElement("div");
    card.className = "class-card";

    card.innerHTML = `
      <h3>${cls.title}</h3>
      <p><strong>Time:</strong> ${cls.time}</p>
      <p><strong>Type:</strong> ${cls.type === "group" ? "Group Class ($80)" : "Personal 1-on-1 ($200/hr)"}</p>
      <p><strong>Spots Left:</strong> ${cls.spots}</p>
      <button class="btn-primary" data-id="${cls.id}">Select This Class</button>
    `;

    const btn = card.querySelector("button");
    btn.addEventListener("click", () => {
      selectedClassId = cls.id;
      selectedClassLabel.textContent = `Selected: ${cls.title} on ${cls.date} at ${cls.time}`;
      signupType.value = cls.type;
    });

    classesList.appendChild(card);
  });
}

// Handle signup
signupSubmit.addEventListener("click", async () => {
  signupStatus.textContent = "";

  if (!selectedClassId) {
    signupStatus.textContent = "Please select a class first.";
    return;
  }

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const type = signupType.value;

  if (!name || !email) {
    signupStatus.textContent = "Please enter your name and email.";
    return;
  }

  // Payload for Cloudflare Worker
  const payload = {
    classId: selectedClassId,
    name,
    email,
    type
  };

  signupStatus.textContent = "Submitting your reservation...";

  try {
    // In production, point this to your Worker route, e.g. /api/class-signup
    const res = await fetch("/api/class-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("Signup failed");
    }

    const data = await res.json();
    signupStatus.textContent = data.message || "Reservation confirmed! Check your email for details.";
  } catch (err) {
    signupStatus.textContent = "There was an issue submitting your reservation. Please try again.";
  }
});

// Init
buildCalendar();

// Optional: auto-select today’s date if it has classes
(function autoSelectToday() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayClasses = demoClasses.filter(c => c.date === todayStr);
  if (todayClasses.length) {
    selectedDate = todayStr;
    // Find matching day div
    const allDays = calendarGrid.querySelectorAll(".calendar-day");
    allDays.forEach(d => {
      if (d.textContent === String(new Date().getDate())) {
        highlightSelectedDay(d);
      }
    });
    renderClassesForDate(todayStr);
  }
})();
