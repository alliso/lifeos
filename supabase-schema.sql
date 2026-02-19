-- Run this SQL in your Supabase SQL editor

CREATE TABLE tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'backlog',
  -- values: 'backlog' | 'todo' | 'active' | 'completed'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  due_date     DATE
);

-- Migration: run this if the table already exists
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cada usuario solo ve sus tareas"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
