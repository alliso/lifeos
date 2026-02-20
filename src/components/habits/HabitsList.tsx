"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitCompletion, HabitWithCompletions } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { HabitCard } from "./HabitCard";
import { CreateHabitDialog } from "./CreateHabitDialog";

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function calcStreak(habit: Habit, completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  if (habit.frequency === "daily") {
    const doneSet = new Set(completions.map((c) => c.completed_date));
    const today = new Date();
    let streak = 0;
    // Start counting from today; if today not done, allow starting from yesterday
    let cursor = new Date(today);
    cursor.setHours(0, 0, 0, 0);

    // If today isn't done, start from yesterday (streak not broken yet)
    const todayStr = cursor.toISOString().slice(0, 10);
    if (!doneSet.has(todayStr)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      const dateStr = cursor.toISOString().slice(0, 10);
      if (!doneSet.has(dateStr)) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  } else {
    // weekly or custom
    const required =
      habit.frequency === "custom" && habit.times_per_week != null
        ? habit.times_per_week
        : 1;

    // Group completions by week start (Monday)
    const weekCounts = new Map<string, number>();
    for (const c of completions) {
      const ws = getWeekStart(c.completed_date);
      weekCounts.set(ws, (weekCounts.get(ws) ?? 0) + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekStart = getWeekStart(today.toISOString().slice(0, 10));

    let streak = 0;
    let cursorDate = new Date(currentWeekStart + "T00:00:00");

    // If current week doesn't meet required, start counting from previous week
    if ((weekCounts.get(currentWeekStart) ?? 0) < required) {
      cursorDate.setDate(cursorDate.getDate() - 7);
    }

    while (true) {
      const ws = cursorDate.toISOString().slice(0, 10);
      if ((weekCounts.get(ws) ?? 0) < required) break;
      streak++;
      cursorDate.setDate(cursorDate.getDate() - 7);
    }
    return streak;
  }
}

export function HabitsList() {
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const supabase = createClient();

  const fetchHabits = useCallback(async () => {
    setLoading(true);

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
      supabase.from("habits").select("*").order("created_at", { ascending: true }),
      supabase
        .from("habit_completions")
        .select("*")
        .gte("completed_date", cutoffStr)
        .order("completed_date", { ascending: false }),
    ]);

    if (!habitsData) {
      setLoading(false);
      return;
    }

    const completionsByHabit = new Map<string, HabitCompletion[]>();
    for (const c of completionsData ?? []) {
      const list = completionsByHabit.get(c.habit_id) ?? [];
      list.push(c);
      completionsByHabit.set(c.habit_id, list);
    }

    const enriched: HabitWithCompletions[] = (habitsData as Habit[]).map((habit) => {
      const completions = completionsByHabit.get(habit.id) ?? [];
      return {
        ...habit,
        completions,
        streak: calcStreak(habit, completions),
        doneToday: completions.some((c) => c.completed_date === todayStr),
      };
    });

    setHabits(enriched);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hábitos</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {habits.length} {habits.length === 1 ? "hábito" : "hábitos"}
              </p>
            )}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo hábito
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-lg border bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-4">
              No tienes hábitos todavía.
            </p>
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear primer hábito
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onRefresh={fetchHabits} />
            ))}
          </div>
        )}
      </div>

      <CreateHabitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchHabits}
      />
    </div>
  );
}
