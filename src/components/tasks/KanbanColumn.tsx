"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import type { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onRefresh: () => void;
  onAddTask: () => void;
}

export function KanbanColumn({ id, title, tasks, onRefresh, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddTask}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-[120px] flex-col gap-2 rounded-md transition-colors ${
              snapshot.isDraggingOver ? "bg-accent/50" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? "opacity-80" : ""}
                  >
                    <TaskCard
                      task={task}
                      onRefresh={onRefresh}
                      showMoveToBacklog
                      dragHandleProps={provided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
