let deferredPwaPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const btn = document.getElementById("installPwaBtn");
  if (btn) btn.style.display = "inline-block";
});

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("appRoot");
  showLoginView(root);
});

function showLoginView(root) {
  const tpl = document.getElementById("loginView");
  root.innerHTML = "";
  root.appendChild(tpl.content.cloneNode(true));

  const form = document.getElementById("appLoginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = new FormData(form).get("email");

    const res = await fetch("/api/app-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (!res.ok) {
      alert("Login failed. Make sure you signed up for a class.");
      return;
    }

    const data = await res.json();
    localStorage.setItem("appToken", data.token);
    loadDashboard();
  });

  const installBtn = document.getElementById("installPwaBtn");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPwaPrompt) return;
      deferredPwaPrompt.prompt();
      await deferredPwaPrompt.userChoice;
      deferredPwaPrompt = null;
      installBtn.style.display = "none";
    });
  }
}

async function loadDashboard() {
  const token = localStorage.getItem("appToken");
  if (!token) {
    const root = document.getElementById("appRoot");
    showLoginView(root);
    return;
  }

  const res = await fetch("/api/app-dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    localStorage.removeItem("appToken");
    const root = document.getElementById("appRoot");
    showLoginView(root);
    return;
  }

  const data = await res.json();
  renderDashboard(data);
}

function renderDashboard(data) {
  const root = document.getElementById("appRoot");
  const tpl = document.getElementById("dashboardView");
  root.innerHTML = "";
  root.appendChild(tpl.content.cloneNode(true));

  root.querySelector('[data-bind="name"]').textContent = data.name;
  root.querySelector('[data-bind="city"]').textContent = data.city;
  root.querySelector('[data-bind="videosCompleted"]').textContent = data.videosCompleted;

  const discounts = Math.floor(data.videosCompleted / 5);
  const discountText = discounts > 0
    ? `${discounts} × 30% off live class`
    : "Complete 5 videos to unlock 30% off a live class.";
  root.querySelector('[data-bind="discount"]').textContent = discountText;

  const tabs = root.querySelector(".tabs");
  const tabContent = root.querySelector("#tabContent");

  tabs.addEventListener("click", (e) => {
    if (!e.target.dataset.tab) return;
    const tab = e.target.dataset.tab;
    if (tab === "lessons") renderLessons(tabContent, data);
    if (tab === "progress") renderProgress(tabContent, data);
    if (tab === "rewards") renderRewards(tabContent, data);
  });

  renderLessons(tabContent, data);
}

function renderLessons(container, data) {
  container.innerHTML = "";
  const list = document.createElement("div");
  list.className = "lessons-list";

  data.lessons.forEach(lesson => {
    const div = document.createElement("div");
    div.className = "lesson-card";
    div.innerHTML = `
      <h3>${lesson.title}</h3>
      <p>${lesson.description || ""}</p>
      <button class="btn secondary" data-lesson-id="${lesson.id}">Watch</button>
    `;
    list.appendChild(div);
  });

  container.appendChild(list);

  list.addEventListener("click", async (e) => {
    if (!e.target.matches("button[data-lesson-id]")) return;
    const lessonId = e.target.getAttribute("data-lesson-id");
    await markVideoWatched(lessonId);
    await loadDashboard();
  });
}

function renderProgress(container, data) {
  container.innerHTML = "";
  const div = document.createElement("div");
  div.innerHTML = `
    <h3>Your Progress</h3>
    <p>Videos completed: ${data.videosCompleted}</p>
    <ul>
      ${data.progress.map(p => `<li>${p.label}: ${p.status}</li>`).join("")}
    </ul>
  `;
  container.appendChild(div);
}

function renderRewards(container, data) {
  container.innerHTML = "";
  const discounts = Math.floor(data.videosCompleted / 5);
  const div = document.createElement("div");
  div.innerHTML = `
    <h3>Rewards</h3>
    <p>Videos completed: ${data.videosCompleted}</p>
    <p>${discounts > 0
      ? `You have ${discounts} × 30% off live class.`
      : "Complete 5 videos to unlock 30% off a live class."}</p>
    <h4>Upcoming Classes in ${data.city}</h4>
    <div id="appClasses"></div>
  `;
  container.appendChild(div);

  renderAppClasses(document.getElementById("appClasses"), data.classes || []);
}

function renderAppClasses(container, classes) {
  if (!classes.length) {
    container.textContent = "No upcoming classes yet.";
    return;
  }
  container.innerHTML = "";
  classes.forEach(cls => {
    const div = document.createElement("div");
    div.className = "class-card";
    div.innerHTML = `
      <h4>${cls.date} @ ${cls.time}</h4>
      <p>Openings: ${cls.openings}</p>
      <button class="btn primary" data-class-id="${cls.id}">Sign Up</button>
    `;
    container.appendChild(div);
  });

  container.addEventListener("click", async (e) => {
    if (!e.target.matches("button[data-class-id]")) return;
    const classId = e.target.getAttribute("data-class-id");
    const token = localStorage.getItem("appToken");
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ classId, source: "app" })
    });
    if (res.ok) {
      alert("You’re signed up for this class.");
      await loadDashboard();
    } else {
      alert("Could not sign you up. Try again.");
    }
  });
}

async function markVideoWatched(lessonId) {
  const token = localStorage.getItem("appToken");
  if (!token) return;
  await fetch("/api/app-progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ lessonId })
  });
}
