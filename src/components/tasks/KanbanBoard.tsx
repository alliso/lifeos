"use client";

import { useCallback, useEffect, useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./KanbanColumn";
import { CreateTaskDialog } from "./CreateTaskDialog";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Por hacer" },
  { id: "active", title: "Activo" },
  { id: "completed", title: "Finalizado" },
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("todo");
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get todo and active tasks (no date filter)
    const { data: todoActive } = await supabase
      .from("tasks")
      .select("*")
      .in("status", ["todo", "active"])
      .order("updated_at", { ascending: false });

    // Get completed tasks from last 7 days
    const { data: recentCompleted } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "completed")
      .gte("completed_at", sevenDaysAgo.toISOString())
      .order("completed_at", { ascending: false });

    setTasks([...(todoActive ?? []), ...(recentCompleted ?? [])]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId as TaskStatus;
    const destStatus = result.destination.droppableId as TaskStatus;

    if (sourceStatus === destStatus) return;

    const taskId = result.draggableId;
    const now = new Date().toISOString();

    const updateData: Record<string, string | null> = {
      status: destStatus,
      updated_at: now,
    };

    if (destStatus === "completed") {
      updateData.completed_at = now;
    } else {
      updateData.completed_at = null;
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: destStatus, completed_at: updateData.completed_at ?? null }
          : t
      )
    );

    await supabase.from("tasks").update(updateData).eq("id", taskId);
  }

  function handleCreateInColumn(status: TaskStatus) {
    setCreateStatus(status);
    setCreateOpen(true);
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tablero</h1>
          <p className="text-sm text-muted-foreground">Vista kanban</p>
        </div>
        <Button onClick={() => handleCreateInColumn("todo")}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva tarea
        </Button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.id)}
              onRefresh={fetchTasks}
              onAddTask={() => handleCreateInColumn(col.id)}
            />
          ))}
        </div>
      </DragDropContext>

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStatus={createStatus}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
