"use client";

import { useState } from "react";
import { Flame, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { HabitWithCompletions } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateHabitDialog } from "./CreateHabitDialog";

interface HabitCardProps {
  habit: HabitWithCompletions;
  onRefresh: () => void;
}

const frequencyLabels: Record<string, string> = {
  daily: "Diario",
  weekly: "Semanal",
};

function getFrequencyLabel(habit: HabitWithCompletions): string {
  if (habit.frequency === "custom" && habit.times_per_week != null) {
    return `${habit.times_per_week} vec/sem`;
  }
  return frequencyLabels[habit.frequency] ?? habit.frequency;
}

function getStreakUnit(habit: HabitWithCompletions): string {
  return habit.frequency === "daily" ? "días" : "semanas";
}

export function HabitCard({ habit, onRefresh }: HabitCardProps) {
  const [doneToday, setDoneToday] = useState(habit.doneToday);
  const [editOpen, setEditOpen] = useState(false);
  const supabase = createClient();

  async function handleToggle() {
    setDoneToday((prev) => !prev);
    const today = new Date().toISOString().slice(0, 10);
    if (!doneToday) {
      await supabase.from("habit_completions").upsert(
        { habit_id: habit.id, completed_date: today, user_id: habit.user_id },
        { onConflict: "habit_id,completed_date" }
      );
    } else {
      await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habit.id)
        .eq("completed_date", today);
    }
    onRefresh();
  }

  async function handleDelete() {
    await supabase.from("habits").delete().eq("id", habit.id);
    onRefresh();
  }

  return (
    <>
      <Card className="group">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug">{habit.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {getFrequencyLabel(habit)}
              </Badge>
              {habit.streak > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
                  <Flame className="h-3.5 w-3.5" />
                  {habit.streak} {getStreakUnit(habit)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant={doneToday ? "default" : "outline"}
              className={doneToday ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              onClick={handleToggle}
            >
              {doneToday ? "Hecho hoy ✓" : "Marcar hoy"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
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
        </CardContent>
      </Card>
      <CreateHabitDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        habit={habit}
        onSuccess={onRefresh}
      />
    </>
  );
}
