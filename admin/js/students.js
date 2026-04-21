document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
});

async function loadStudents() {
  const listEl = document.getElementById("studentsList");
  const detailsEl = document.getElementById("studentDetails");

  try {
    const res = await fetch("/api/admin/students");
    if (!res.ok) {
      listEl.textContent = "Failed to load students.";
      return;
    }
    const students = await res.json();

    if (!students.length) {
      listEl.textContent = "No students yet.";
      return;
    }

    listEl.innerHTML = "";
    students.forEach(stu => {
      const div = document.createElement("div");
      div.className = "student-row";
      div.innerHTML = `
        <button class="link" data-id="${stu.id}">
          ${stu.name} — ${stu.email}
        </button>
      `;
      listEl.appendChild(div);
    });

    listEl.addEventListener("click", async (e) => {
      if (!e.target.matches("button[data-id]")) return;
      const id = e.target.getAttribute("data-id");
      await loadStudentDetails(id, detailsEl);
    });
  } catch {
    listEl.textContent = "Error loading students.";
  }
}

async function loadStudentDetails(id, container) {
  container.innerHTML = "Loading...";
  try {
    const res = await fetch(`/api/admin/students/${id}`);
    if (!res.ok) {
      container.textContent = "Failed to load student details.";
      return;
    }
    const data = await res.json();
    container.innerHTML = `
      <h3>${data.name}</h3>
      <p>Email: ${data.email}</p>
      <p>Phone: ${data.phone || "N/A"}</p>
      <p>City: ${data.city || "N/A"}</p>
      <h4>Progress</h4>
      <ul>
        ${data.progress.map(p => `<li>${p.label}: ${p.status}</li>`).join("")}
      </ul>
    `;
  } catch {
    container.textContent = "Error loading student details.";
  }
}
