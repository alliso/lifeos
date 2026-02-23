-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'backlog',
  -- values: 'backlog' | 'todo' | 'active' | 'completed' | 'cancelled'
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  due_date     DATE
);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Cada usuario solo ve sus tareas'
  ) THEN
    CREATE POLICY "Cada usuario solo ve sus tareas"
      ON tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Habits
CREATE TABLE IF NOT EXISTS habits (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name           TEXT NOT NULL,
  frequency      TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  times_per_week INTEGER,  -- solo cuando frequency = 'custom'
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id       UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(habit_id, completed_date)
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'habits' AND policyname = 'Cada usuario gestiona sus hábitos'
  ) THEN
    CREATE POLICY "Cada usuario gestiona sus hábitos"
      ON habits FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'habit_completions' AND policyname = 'Cada usuario gestiona sus completions'
  ) THEN
    CREATE POLICY "Cada usuario gestiona sus completions"
      ON habit_completions FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
