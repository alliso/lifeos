export type TaskStatus = "backlog" | "todo" | "active" | "completed";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export type TaskInsert = Omit<Task, "id" | "user_id" | "created_at" | "updated_at">;

export type TaskUpdate = Partial<Omit<Task, "id" | "user_id" | "created_at">>;
