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

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WorkoutStatus = 'reserved' | 'completed';

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  notes: string | null;
  day_of_week: DayOfWeek;
  session_time: string | null;  // 'HH:MM'
  active: boolean;
  created_at: string;
  updated_at: string;
}
export type WorkoutPlanInsert = Omit<WorkoutPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string | null;
  session_date: string;
  session_time: string | null;  // 'HH:MM'
  name: string;
  notes: string | null;
  status: WorkoutStatus;
  created_at: string;
  updated_at: string;
}
export type WorkoutSessionInsert = Omit<WorkoutSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export interface WorkoutEntry {
  kind: 'session' | 'plan_projection';
  key: string;
  session: WorkoutSession | null;
  plan: WorkoutPlan | null;
  date: string;              // 'YYYY-MM-DD'
  session_time: string | null;
  name: string;
  notes: string | null;
  status: WorkoutStatus | null;  // null para plan_projection
}
