CREATE TABLE IF NOT EXISTS class_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  class_id TEXT NOT NULL,
  discount_used INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (class_id) REFERENCES classes(id)
);
