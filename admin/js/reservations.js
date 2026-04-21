document.addEventListener("DOMContentLoaded", () => {
  loadReservations();
});

async function loadReservations() {
  const listEl = document.getElementById("reservationsList");
  listEl.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/admin/reservations");
    if (!res.ok) {
      listEl.textContent = "Failed to load reservations.";
      return;
    }
    const reservations = await res.json();

    if (!reservations.length) {
      listEl.textContent = "No reservations yet.";
      return;
    }

    listEl.innerHTML = "";
    reservations.forEach(r => {
      const div = document.createElement("div");
      div.className = "reservation-row";
      div.innerHTML = `
        <p><strong>${r.name}</strong> — ${r.email}</p>
        <p>Class: ${r.classLabel}</p>
        <p>City: ${r.city}</p>
        <p>Source: ${r.source}</p>
        <p>Status: ${r.status}</p>
      `;
      listEl.appendChild(div);
    });
  } catch {
    listEl.textContent = "Error loading reservations.";
  }
}
