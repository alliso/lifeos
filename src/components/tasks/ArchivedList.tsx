"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";

export function ArchivedList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "completed")
      .lt("completed_at", sevenDaysAgo.toISOString())
      .order("completed_at", { ascending: false });

    setTasks(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">Archivados</h1>
        <p className="text-sm text-muted-foreground">
          Tareas finalizadas hace más de 7 días ·{" "}
          {tasks.length} {tasks.length === 1 ? "tarea" : "tareas"}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">No hay tareas archivadas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onRefresh={fetchTasks}
              showMoveToBacklog
            />
          ))}
        </div>
      )}
    </div>
  );
}
