document.addEventListener("DOMContentLoaded", () => {
  const classesList = document.getElementById("classesList");

  if (classesList) {
    initClassesPage();
  }
});

async function initClassesPage() {
  const container = document.getElementById("classesList");
  const classes = await loadClasses();

  if (!classes.length) {
    container.textContent = "No classes scheduled yet. Check back soon.";
    return;
  }

  container.innerHTML = "";
  classes.forEach(cls => {
    const div = document.createElement("div");
    div.className = "class-card";
    div.innerHTML = `
      <h3>${cls.city} — ${cls.date} @ ${cls.time}</h3>
      <p>Openings: ${cls.openings}</p>
      <p>${cls.description || ""}</p>
      <button class="btn primary" data-class-id="${cls.id}">Sign Up</button>
    `;
    container.appendChild(div);
  });

  container.addEventListener("click", async (e) => {
    if (!e.target.matches("button[data-class-id]")) return;
    const classId = e.target.getAttribute("data-class-id");

    const name = prompt("Your name:");
    const email = prompt("Your email:");
    const phone = prompt("Your phone:");

    if (!name || !email || !phone) return;

    const payload = { name, email, phone, classId, source: "web" };

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("You’re signed up. Check your email for app access.");
    } else {
      alert("Could not sign you up. Try again.");
    }
  });
}

async function loadClasses() {
  try {
    const res = await fetch("/api/classes");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
