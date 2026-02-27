"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutPlan, WorkoutSession, WorkoutEntry, DayOfWeek } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DayColumn } from "./DayColumn";
import { WorkoutDialog } from "./WorkoutDialog";

// Returns 'YYYY-MM-DD' for the Monday of the week containing `date`
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Formats week range like "24 feb – 2 mar 2026"
function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const startStr = weekStart.toLocaleDateString("es-ES", opts);
  const endStr = weekEnd.toLocaleDateString("es-ES", { ...opts, year: "numeric" });
  return `${startStr} – ${endStr}`;
}

export function WeeklyCalendar() {
  const today = toDateString(new Date());
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(today);
  const [dialogDayOfWeek, setDialogDayOfWeek] = useState<DayOfWeek>(0);

  const supabase = createClient();

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartStr = toDateString(weekStart);
  const weekEndStr = toDateString(addDays(weekStart, 6));

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [{ data: plansData }, { data: sessionsData }] = await Promise.all([
      supabase.from("workout_plans").select("*").order("created_at", { ascending: true }),
      supabase
        .from("workout_sessions")
        .select("*")
        .gte("session_date", weekStartStr)
        .lte("session_date", weekEndStr)
        .order("created_at", { ascending: true }),
    ]);

    setPlans((plansData as WorkoutPlan[]) ?? []);
    setSessions((sessionsData as WorkoutSession[]) ?? []);
    setLoading(false);
  }, [supabase, weekStartStr, weekEndStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function computeEntriesForDate(dateStr: string, dow: DayOfWeek): WorkoutEntry[] {
    const daySessions = sessions.filter((s) => s.session_date === dateStr);
    const entries: WorkoutEntry[] = [];

    // Real sessions
    for (const session of daySessions) {
      entries.push({
        kind: "session",
        key: `session-${session.id}`,
        session,
        plan: plans.find((p) => p.id === session.plan_id) ?? null,
        date: dateStr,
        session_time: session.session_time,
        name: session.name,
        notes: session.notes,
        status: session.status,
      });
    }

    // Plan projections — only if no session already covers this plan for this date
    const coveredPlanIds = new Set(daySessions.map((s) => s.plan_id).filter(Boolean));
    const matchingPlans = plans.filter((p) => p.day_of_week === dow);

    for (const plan of matchingPlans) {
      if (!coveredPlanIds.has(plan.id)) {
        entries.push({
          kind: "plan_projection",
          key: `plan-${plan.id}-${dateStr}`,
          session: null,
          plan,
          date: dateStr,
          session_time: plan.session_time,
          name: plan.name,
          notes: plan.notes,
          status: null,
        });
      }
    }

    // Sort by time: entries with time first (ascending), then without time
    entries.sort((a, b) => {
      if (a.session_time && b.session_time) return a.session_time.localeCompare(b.session_time);
      if (a.session_time) return -1;
      if (b.session_time) return 1;
      return 0;
    });

    return entries;
  }

  function handleAddClick(date: string, dow: DayOfWeek) {
    setDialogDate(date);
    setDialogDayOfWeek(dow);
    setDialogOpen(true);
  }

  function goToPrevWeek() {
    setWeekStart((prev) => addDays(prev, -7));
  }

  function goToNextWeek() {
    setWeekStart((prev) => addDays(prev, 7));
  }

  function goToToday() {
    setWeekStart(getWeekStart(new Date()));
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrenamientos</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {formatWeekRange(weekStart)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goToPrevWeek} aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek} aria-label="Semana siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-3 flex-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-muted/40 animate-pulse min-h-40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3 flex-1 min-h-0">
          {weekDates.map((date, i) => {
            const dateStr = toDateString(date);
            const dow = i as DayOfWeek;
            const entries = computeEntriesForDate(dateStr, dow);
            return (
              <DayColumn
                key={dateStr}
                date={dateStr}
                dayOfWeek={dow}
                today={today}
                entries={entries}
                onAdd={() => handleAddClick(dateStr, dow)}
                onRefresh={fetchData}
              />
            );
          })}
        </div>
      )}

      <WorkoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={dialogDate}
        dayOfWeek={dialogDayOfWeek}
        onSuccess={fetchData}
      />
    </div>
  );
}
