// admin.js

document.getElementById("admin-year").textContent = new Date().getFullYear();

// Load students from localStorage (later: from real DB)
const studentsTableBody = document.getElementById("students-table-body");

function renderStudents() {
  if (!studentsTableBody) return;

  const students = JSON.parse(localStorage.getItem("ccc_students") || "[]");
  studentsTableBody.innerHTML = "";

  if (!students.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "No reservations yet.";
    cell.className = "muted";
    row.appendChild(cell);
    studentsTableBody.appendChild(row);
    return;
  }

  students
    .sort((a, b) => b.id - a.id)
    .forEach((s) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td>${s.session}</td>
        <td>${new Date(s.createdAt).toLocaleString()}</td>
      `;
      studentsTableBody.appendChild(row);
    });
}

renderStudents();

// Lesson management
const lessonForm = document.getElementById("lesson-form");
const lessonMessage = document.getElementById("lesson-message");
const lessonList = document.getElementById("lesson-list");

function loadLessons() {
  return JSON.parse(localStorage.getItem("ccc_lessons") || "[]");
}

function saveLessons(lessons) {
  localStorage.setItem("ccc_lessons", JSON.stringify(lessons));
}

function renderLessons() {
  if (!lessonList) return;

  const lessons = loadLessons();
  lessonList.innerHTML = "";

  if (!lessons.length) {
    lessonList.innerHTML = '<p class="muted">No lessons created yet.</p>';
    return;
  }

  lessons
    .sort((a, b) => b.id - a.id)
    .forEach((lesson) => {
      const card = document.createElement("article");
      card.className = "lesson-card";

      const typeLabel = lesson.type === "video" ? "Video" : "Guide";
      const publicLabel = lesson.isPublic ? "Public" : "Private";

      card.innerHTML = `
        <div class="lesson-type">${typeLabel} • ${publicLabel}</div>
        <h3>${lesson.title}</h3>
        ${
          lesson.type === "video" && lesson.url
            ? `<p><a href="${lesson.url}" target="_blank" class="btn-secondary">Open Video</a></p>`
            : ""
        }
        ${
          lesson.type === "guide" && lesson.body
            ? `<p>${lesson.body.substring(0, 200)}${
                lesson.body.length > 200 ? "..." : ""
              }</p>`
            : ""
        }
        <button class="btn-secondary" data-id="${lesson.id}">Delete</button>
      `;

      lessonList.appendChild(card);
    });

  // Delete handlers
  lessonList.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      const lessons = loadLessons().filter((l) => l.id !== id);
      saveLessons(lessons);
      renderLessons();
    });
  });
}

if (lessonForm) {
  lessonForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("lesson-title").value.trim();
    const type = document.getElementById("lesson-type").value;
    const url = document.getElementById("lesson-url").value.trim();
    const body = document.getElementById("lesson-body").value.trim();
    const isPublic = document.getElementById("lesson-public").checked;

    if (!title || !type) {
      lessonMessage.textContent = "Title and type are required.";
      lessonMessage.className = "form-message error";
      return;
    }

    if (type === "video" && !url) {
      lessonMessage.textContent = "Video lessons need a URL.";
      lessonMessage.className = "form-message error";
      return;
    }

    if (type === "guide" && !body) {
      lessonMessage.textContent = "Guide lessons need some text.";
      lessonMessage.className = "form-message error";
      return;
    }

    const lessons = loadLessons();
    lessons.push({
      id: Date.now(),
      title,
      type,
      url,
      body,
      isPublic,
      createdAt: new Date().toISOString(),
    });
    saveLessons(lessons);

    lessonMessage.textContent = "Lesson saved.";
    lessonMessage.className = "form-message success";
    lessonForm.reset();
    renderLessons();
  });
}

renderLessons();
