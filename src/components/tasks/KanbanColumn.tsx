"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onRefresh: () => void;
}

export function KanbanColumn({ id, title, tasks, onRefresh }: KanbanColumnProps) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
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
