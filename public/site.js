// Detect which page we’re on
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("classSignupForm")) {
    initHomePage();
  }
  if (document.getElementById("classesList")) {
    initClassesPage();
  }
});

// Load cities + handle signup on homepage
function initHomePage() {
  const citySelect = document.getElementById("citySelect");
  const form = document.getElementById("classSignupForm");

  loadClasses().then(classes => {
    // Unique cities from classes
    const cities = [...new Set(classes.map(c => c.city))];
    citySelect.innerHTML = "";
    cities.forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city")
    };

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Thanks! You’re signed up. Check your email for app access.");
      form.reset();
    } else {
      alert("Something went wrong. Please try again.");
    }
  });
}

// Load classes + render schedule page
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
    if (e.target.matches("button[data-class-id]")) {
      const classId = e.target.getAttribute("data-class-id");
      const name = prompt("Your name:");
      const email = prompt("Your email:");
      const phone = prompt("Your phone:");

      if (!name || !email || !phone) return;

      const payload = { name, email, phone, classId };

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("You’re signed up for this class. Check your email for app access.");
      } else {
        alert("Could not sign you up. Please try again.");
      }
    }
  });
}

// Shared: load classes from backend
async function loadClasses() {
  try {
    const res = await fetch("/api/classes");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
