-- STUDENTS
CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- CLASSES
CREATE TABLE classes (
  id TEXT PRIMARY KEY,
  city TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  openings INTEGER NOT NULL,
  description TEXT
);

-- RESERVATIONS
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  source TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- LESSONS
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT
);

-- PROGRESS
CREATE TABLE progress (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- CITIES
CREATE TABLE cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER DEFAULT 1
);
