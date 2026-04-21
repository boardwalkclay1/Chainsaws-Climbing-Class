document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addCityForm");
  form.addEventListener("submit", handleAddCity);
  loadCities();
});

async function loadCities() {
  const listEl = document.getElementById("citiesList");
  listEl.innerHTML = "Loading...";

  try {
    const res = await fetch("/api/admin/cities");
    if (!res.ok) {
      listEl.textContent = "Failed to load cities.";
      return;
    }
    const cities = await res.json();

    if (!cities.length) {
      listEl.textContent = "No cities yet.";
      return;
    }

    listEl.innerHTML = "";
    cities.forEach(city => {
      const div = document.createElement("div");
      div.className = "city-row";
      div.innerHTML = `
        <span>${city.name}</span>
        <span>${city.active ? "Active" : "Inactive"}</span>
      `;
      listEl.appendChild(div);
    });
  } catch {
    listEl.textContent = "Error loading cities.";
  }
}

async function handleAddCity(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const name = formData.get("city");

  try {
    const res = await fetch("/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      alert("Failed to add city.");
      return;
    }

    alert("City added.");
    form.reset();
    loadCities();
  } catch {
    alert("Error adding city.");
  }
}
