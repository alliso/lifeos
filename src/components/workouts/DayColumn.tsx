"use client";

import { Plus } from "lucide-react";
import type { WorkoutEntry, DayOfWeek } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { WorkoutCard } from "./WorkoutCard";

const DAY_ABBR: Record<number, string> = {
  0: "Lun",
  1: "Mar",
  2: "Mié",
  3: "Jue",
  4: "Vie",
  5: "Sáb",
  6: "Dom",
};

interface DayColumnProps {
  date: string;           // 'YYYY-MM-DD'
  dayOfWeek: DayOfWeek;
  today: string;          // 'YYYY-MM-DD'
  entries: WorkoutEntry[];
  onAdd: () => void;
  onRefresh: () => void;
}

export function DayColumn({ date, dayOfWeek, today, entries, onAdd, onRefresh }: DayColumnProps) {
  const dayNum = parseInt(date.slice(8, 10), 10);
  const isToday = date === today;

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex flex-col items-center pb-2 mb-2 border-b">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {DAY_ABBR[dayOfWeek]}
        </span>
        <span
          className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
            isToday
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          }`}
        >
          {dayNum}
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {entries.map((entry) => (
          <WorkoutCard
            key={entry.key}
            entry={entry}
            dayOfWeek={dayOfWeek}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Agregar
      </button>
    </div>
  );
}
