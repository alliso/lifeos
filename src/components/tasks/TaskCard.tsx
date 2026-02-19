"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "./CreateTaskDialog";

interface TaskCardProps {
  task: Task;
  onRefresh: () => void;
  showMoveToBoard?: boolean;
  showMoveToBacklog?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const statusColors: Record<string, string> = {
  backlog: "secondary",
  todo: "outline",
  active: "default",
  completed: "secondary",
};

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "Por hacer",
  active: "Activo",
  completed: "Finalizado",
};

export function TaskCard({
  task,
  onRefresh,
  showMoveToBoard = false,
  showMoveToBacklog = false,
  dragHandleProps,
}: TaskCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const supabase = createClient();

  async function handleDelete() {
    await supabase.from("tasks").delete().eq("id", task.id);
    onRefresh();
  }

  async function handleMoveToBoard() {
    await supabase
      .from("tasks")
      .update({ status: "todo", updated_at: new Date().toISOString() })
      .eq("id", task.id);
    onRefresh();
  }

  async function handleMoveToBacklog() {
    await supabase
      .from("tasks")
      .update({
        status: "backlog",
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task.id);
    onRefresh();
  }

  return (
    <>
      <Card className="group relative cursor-default">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex-1 min-w-0"
              {...(dragHandleProps || {})}
            >
              <p className="text-sm font-medium leading-snug">{task.title}</p>
              {task.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                {showMoveToBoard && (
                  <DropdownMenuItem onClick={handleMoveToBoard}>
                    <ArrowRight className="mr-2 h-3.5 w-3.5" />
                    Mover al tablero
                  </DropdownMenuItem>
                )}
                {showMoveToBacklog && (
                  <DropdownMenuItem onClick={handleMoveToBacklog}>
                    <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                    Mover al backlog
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="mt-2">
            <Badge variant={statusColors[task.status] as "secondary" | "outline" | "default" | "destructive"} className="text-xs">
              {statusLabels[task.status]}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <CreateTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={task}
        onSuccess={onRefresh}
      />
    </>
  );
}
