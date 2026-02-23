export type TaskStatus = "backlog" | "todo" | "active" | "completed" | "cancelled";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  due_date: string | null;
}

export type TaskInsert = Omit<Task, "id" | "user_id" | "created_at" | "updated_at">;

export type TaskUpdate = Partial<Omit<Task, "id" | "user_id" | "created_at">>;

export type HabitFrequency = "daily" | "weekly" | "custom";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: HabitFrequency;
  times_per_week: number | null;
  created_at: string;
  updated_at: string;
}

export type HabitInsert = Omit<Habit, "id" | "user_id" | "created_at" | "updated_at">;
export type HabitUpdate = Partial<Omit<Habit, "id" | "user_id" | "created_at">>;

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[]; // últimos 90 días
  streak: number;                 // calculado en cliente
  doneToday: boolean;
}
