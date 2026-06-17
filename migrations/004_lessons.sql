CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
