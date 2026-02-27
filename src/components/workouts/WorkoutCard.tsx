"use client";

import { useState } from "react";
import { Dumbbell, MoreHorizontal, Pencil, Trash2, Plus, Clock, PauseCircle, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutEntry, WorkoutStatus, DayOfWeek } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkoutDialog } from "./WorkoutDialog";
import { WorkoutDetailDialog } from "./WorkoutDetailDialog";

const STATUS_CYCLE: WorkoutStatus[] = ["reserved", "completed"];

const STATUS_CONFIG: Record<WorkoutStatus, { label: string; cardClass: string; dotClass: string }> = {
  reserved: {
    label: "Reservado",
    cardClass: "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800",
    dotClass: "bg-blue-500 border-blue-500",
  },
  completed: {
    label: "Completado",
    cardClass: "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
    dotClass: "bg-green-600 border-green-600",
  },
};

function StatusBadge({ status }: { status: WorkoutStatus }) {
  const colorClass =
    status === "reserved"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${colorClass}`}>
      {STATUS_CONFIG[status].label}
    </span>
  );
}

interface WorkoutCardProps {
  entry: WorkoutEntry;
  dayOfWeek: DayOfWeek;
  onRefresh: () => void;
}

export function WorkoutCard({ entry, dayOfWeek, onRefresh }: WorkoutCardProps) {
  const [currentStatus, setCurrentStatus] = useState<WorkoutStatus>(() => {
    const s = entry.status ?? "reserved";
    return s in STATUS_CONFIG ? s : "reserved";
  });
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const supabase = createClient();

  async function handleRegisterSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("workout_sessions").insert({
      user_id: user.id,
      plan_id: entry.plan?.id ?? null,
      session_date: entry.date,
      session_time: entry.session_time,
      name: entry.name,
      notes: entry.notes,
      status: "reserved",
    });
    onRefresh();
  }

  async function handleCycleStatus() {
    if (entry.kind !== "session" || !entry.session) return;
    const idx = STATUS_CYCLE.indexOf(currentStatus);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setCurrentStatus(next);
    await supabase
      .from("workout_sessions")
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq("id", entry.session.id);
    onRefresh();
  }

  async function handleToggleActive() {
    if (!entry.plan) return;
    await supabase
      .from("workout_plans")
      .update({ active: !entry.plan.active, updated_at: new Date().toISOString() })
      .eq("id", entry.plan.id);
    onRefresh();
  }

  async function handleDelete() {
    if (entry.kind === "session" && entry.session) {
      await supabase.from("workout_sessions").delete().eq("id", entry.session.id);
    } else if (entry.kind === "plan_projection" && entry.plan) {
      await supabase.from("workout_plans").delete().eq("id", entry.plan.id);
    }
    onRefresh();
  }

  // Plan projection
  if (entry.kind === "plan_projection") {
    const isActive = entry.plan?.active !== false;
    return (
      <div className={`group rounded-md border p-2.5 space-y-1.5 ${isActive ? "bg-background" : "bg-muted/40 opacity-60"}`}>
        <div className="flex items-start gap-2">
          <Dumbbell className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setDetailOpen(true)}
              className="text-xs font-medium leading-snug truncate text-left w-full hover:underline"
            >
              {entry.name}
            </button>
            {entry.session_time && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
                <Clock className="h-2.5 w-2.5" />
                {entry.session_time.slice(0, 5)}
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Editar plantilla
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                {isActive ? (
                  <><PauseCircle className="mr-2 h-3.5 w-3.5" />Desactivar plantilla</>
                ) : (
                  <><PlayCircle className="mr-2 h-3.5 w-3.5" />Activar plantilla</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Eliminar plantilla
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive ? (
            <>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Plantilla</Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] px-2 py-0"
                onClick={handleRegisterSession}
              >
                <Plus className="h-2.5 w-2.5 mr-1" />
                Registrar sesión
              </Button>
            </>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-muted-foreground">Desactivada</Badge>
          )}
        </div>
        <WorkoutDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          date={entry.date}
          dayOfWeek={dayOfWeek}
          plan={entry.plan}
          onSuccess={onRefresh}
        />
        <WorkoutDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          plan={entry.plan}
          onRefresh={onRefresh}
        />
      </div>
    );
  }

  // Real session
  const config = STATUS_CONFIG[currentStatus];

  return (
    <div className={`group rounded-md border p-2.5 space-y-1.5 ${config.cardClass}`}>
      <div className="flex items-start gap-2">
        <button
          onClick={handleCycleStatus}
          title={`${config.label} — clic para cambiar`}
          className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${config.dotClass}`}
          aria-label="Cambiar estado"
        >
          {currentStatus === "completed" && (
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1.5,5 4,7.5 8.5,2.5" />
            </svg>
          )}
          {currentStatus === "reserved" && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <button
            onClick={() => setDetailOpen(true)}
            className={`text-xs font-medium leading-snug truncate text-left w-full hover:underline ${currentStatus === "completed" ? "line-through text-muted-foreground" : ""}`}
          >
            {entry.name}
          </button>
          {entry.session_time && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
              <Clock className="h-2.5 w-2.5" />
              {entry.session_time.slice(0, 5)}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <StatusBadge status={currentStatus} />

      <WorkoutDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        date={entry.date}
        dayOfWeek={dayOfWeek}
        session={entry.session}
        onSuccess={onRefresh}
      />
      <WorkoutDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        session={entry.session}
        onRefresh={onRefresh}
      />
    </div>
  );
}
