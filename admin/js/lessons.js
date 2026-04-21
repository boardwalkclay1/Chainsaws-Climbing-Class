document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addLessonForm");
  form.addEventListener("submit", handleAddLesson);
  loadLessons();
});

async function handleAddLesson(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      alert("Failed to add lesson.");
      return;
    }

    alert("Lesson added.");
    form.reset();
    loadLessons();
  } catch {
    alert("Error adding lesson.");
  }
}

async function loadLessons() {
  const listEl = document.getElementById("lessonsList");
  listEl.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/admin/lessons");
    if (!res.ok) {
      listEl.textContent = "Failed to load lessons.";
      return;
    }
    const lessons = await res.json();

    if (!lessons.length) {
      listEl.textContent = "No lessons yet.";
      return;
    }

    listEl.innerHTML = "";
    lessons.forEach(lesson => {
      const div = document.createElement("div");
      div.className = "lesson-row";
      div.innerHTML = `
        <h3>${lesson.title}</h3>
        <p>${lesson.description || ""}</p>
        <p>Video: ${lesson.videoUrl ? "Uploaded" : "None"}</p>
      `;
      listEl.appendChild(div);
    });
  } catch {
    listEl.textContent = "Error loading lessons.";
  }
}
