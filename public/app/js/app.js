// /js/app.js

// Simple data structures for lessons and knots.
// You only edit these arrays when you add videos.

const lessons = [
  { id: 'lesson-1', title: 'Intro to Chainsaw Climbing', file: '/videos/lesson-1.mp4' },
  { id: 'lesson-2', title: 'Harness & PPE Setup', file: '/videos/lesson-2.mp4' },
  { id: 'lesson-3', title: 'Basic Ascent Techniques', file: '/videos/lesson-3.mp4' }
];

const knots = [
  { id: 'knot-figure8', title: 'Figure 8 Knot', file: '/videos/knot-figure8.mp4' },
  { id: 'knot-blakes', title: 'Blake’s Hitch', file: '/videos/knot-blakes.mp4' }
];

const schedule = [
  { date: '2026-07-01', name: 'Beginner Chainsaw Climbing', location: 'Atlanta Beltline Trees' },
  { date: '2026-07-08', name: 'Intermediate Rigging & Rescue', location: 'Atlanta Training Site' }
];

// Progress storage in localStorage
const STORAGE_KEY = 'chainsaw-progress';

function getProgress() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { lessonsCompleted: [], knotsCompleted: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { lessonsCompleted: [], knotsCompleted: [] };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// Render lessons list
function renderLessons() {
  const container = document.getElementById('lessons-list');
  const player = document.getElementById('lesson-player');
  const source = document.getElementById('lesson-source');
  if (!container || !player || !source) return;

  const progress = getProgress();

  container.innerHTML = '';
  lessons.forEach(lesson => {
    const card = document.createElement('div');
    card.className = 'lesson-card';

    const title = document.createElement('h3');
    title.textContent = lesson.title;

    const meta = document.createElement('p');
    const completed = progress.lessonsCompleted.includes(lesson.id);
    meta.textContent = completed ? 'Completed ✅' : 'Not completed';

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Play';
    btn.addEventListener('click', () => {
      source.src = lesson.file;
      player.load();
      player.play();

      if (!progress.lessonsCompleted.includes(lesson.id)) {
        progress.lessonsCompleted.push(lesson.id);
        saveProgress(progress);
        renderProgress();
        renderRewards();
        renderLessons();
      }
    });

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// Render knots list
function renderKnots() {
  const container = document.getElementById('knots-list');
  const player = document.getElementById('knot-player');
  const source = document.getElementById('knot-source');
  if (!container || !player || !source) return;

  const progress = getProgress();

  container.innerHTML = '';
  knots.forEach(knot => {
    const card = document.createElement('div');
    card.className = 'lesson-card';

    const title = document.createElement('h3');
    title.textContent = knot.title;

    const meta = document.createElement('p');
    const completed = progress.knotsCompleted.includes(knot.id);
    meta.textContent = completed ? 'Completed ✅' : 'Not completed';

    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Play';
    btn.addEventListener('click', () => {
      source.src = knot.file;
      player.load();
      player.play();

      if (!progress.knotsCompleted.includes(knot.id)) {
        progress.knotsCompleted.push(knot.id);
        saveProgress(progress);
        renderProgress();
        renderRewards();
        renderKnots();
      }
    });

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

// Render progress
function renderProgress() {
  const progress = getProgress();
  const lessonsEl = document.getElementById('progress-lessons');
  const knotsEl = document.getElementById('progress-knots');
  const totalEl = document.getElementById('progress-total');

  if (lessonsEl) lessonsEl.textContent = progress.lessonsCompleted.length;
  if (knotsEl) knotsEl.textContent = progress.knotsCompleted.length;
  if (totalEl) totalEl.textContent = progress.lessonsCompleted.length + progress.knotsCompleted.length;
}

// Render rewards
function renderRewards() {
  const progress = getProgress();
  const total = progress.lessonsCompleted.length + progress.knotsCompleted.length;
  const rewardsCount = Math.floor(total / 5);

  const totalEl = document.getElementById('rewards-total');
  const countEl = document.getElementById('rewards-count');
  const nextEl = document.getElementById('rewards-next');

  if (totalEl) totalEl.textContent = total;
  if (countEl) countEl.textContent = rewardsCount;
  if (nextEl) nextEl.textContent = (rewardsCount + 1) * 5;
}

// Render schedule
function renderSchedule() {
  const tbody = document.getElementById('schedule-table');
  if (!tbody) return;

  tbody.innerHTML = '';
  schedule.forEach(item => {
    const tr = document.createElement('tr');

    const tdDate = document.createElement('td');
    tdDate.textContent = item.date;

    const tdName = document.createElement('td');
    tdName.textContent = item.name;

    const tdLoc = document.createElement('td');
    tdLoc.textContent = item.location;

    tr.appendChild(tdDate);
    tr.appendChild(tdName);
    tr.appendChild(tdLoc);
    tbody.appendChild(tr);
  });
}

// Account login (simple email store)
function setupAccount() {
  const input = document.getElementById('account-email');
  const btn = document.getElementById('account-login');
  if (!input || !btn) return;

  const stored = localStorage.getItem('chainsaw-email');
  if (stored) input.value = stored;

  btn.addEventListener('click', () => {
    localStorage.setItem('chainsaw-email', input.value.trim());
    alert('Account linked to: ' + input.value.trim());
  });
}

// Init per page
document.addEventListener('DOMContentLoaded', () => {
  renderLessons();
  renderKnots();
  renderProgress();
  renderRewards();
  renderSchedule();
  setupAccount();
});
