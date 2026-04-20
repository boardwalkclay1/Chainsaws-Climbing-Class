// app.js

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Booking form logic (front-end only for now)
const bookingForm = document.getElementById("booking-form");
const bookingMessage = document.getElementById("booking-message");

if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = bookingForm.name.value.trim();
    const email = bookingForm.email.value.trim();
    const phone = bookingForm.phone.value.trim();
    const session = bookingForm.session.value;

    if (!name || !email || !phone || !session) {
      bookingMessage.textContent = "Please fill out all fields.";
      bookingMessage.className = "form-message error";
      return;
    }

    // In production: send to your backend (fetch/POST)
    // For now: store in localStorage so admin can see it
    const record = {
      id: Date.now(),
      name,
      email,
      phone,
      session,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("ccc_students") || "[]");
    existing.push(record);
    localStorage.setItem("ccc_students", JSON.stringify(existing));

    bookingMessage.textContent =
      "Reservation received! You’ll get an email with payment instructions (placeholder).";
    bookingMessage.className = "form-message success";

    bookingForm.reset();
  });
}

// Public lessons placeholder (later: load from backend)
const publicLessonsContainer = document.getElementById("public-lessons");

function renderPublicLessons() {
  if (!publicLessonsContainer) return;

  const lessons = JSON.parse(localStorage.getItem("ccc_lessons") || "[]");
  const publicLessons = lessons.filter((l) => l.isPublic);

  if (!publicLessons.length) {
    publicLessonsContainer.innerHTML =
      '<p class="muted">No public lesson videos or guides yet. Check back soon.</p>';
    return;
  }

  publicLessonsContainer.innerHTML = "";
  publicLessons.forEach((lesson) => {
    const card = document.createElement("article");
    card.className = "lesson-card";

    const typeLabel = lesson.type === "video" ? "Video" : "Guide";

    card.innerHTML = `
      <div class="lesson-type">${typeLabel}</div>
      <h3>${lesson.title}</h3>
      ${
        lesson.type === "video" && lesson.url
          ? `<p><a href="${lesson.url}" target="_blank" class="btn-secondary">Watch Video</a></p>`
          : ""
      }
      ${
        lesson.type === "guide" && lesson.body
          ? `<p>${lesson.body.substring(0, 180)}${
              lesson.body.length > 180 ? "..." : ""
            }</p>`
          : ""
      }
    `;

    publicLessonsContainer.appendChild(card);
  });
}

renderPublicLessons();
