"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutPlan, WorkoutSession, WorkoutStatus, DayOfWeek } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const DAY_NAMES: Record<number, string> = {
  0: "Lunes", 1: "Martes", 2: "Miércoles", 3: "Jueves",
  4: "Viernes", 5: "Sábado", 6: "Domingo",
};

const STATUS_OPTIONS: { value: WorkoutStatus; label: string }[] = [
  { value: "reserved",  label: "Reservado" },
  { value: "completed", label: "Completado" },
];

type Mode = "session" | "plan";

interface WorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  dayOfWeek: DayOfWeek;
  session?: WorkoutSession | null;
  plan?: WorkoutPlan | null;
  onSuccess: () => void;
}

export function WorkoutDialog({
  open,
  onOpenChange,
  date,
  dayOfWeek,
  session,
  plan,
  onSuccess,
}: WorkoutDialogProps) {
  const isEditing = !!(session || plan);
  const initialMode: Mode = plan && !session ? "plan" : "session";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [status, setStatus] = useState<WorkoutStatus>("reserved");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      if (session) {
        setMode("session");
        setName(session.name);
        setNotes(session.notes ?? "");
        setSessionTime(session.session_time ?? "");
        setStatus(session.status);
      } else if (plan) {
        setMode("plan");
        setName(plan.name);
        setNotes(plan.notes ?? "");
        setSessionTime(plan.session_time ?? "");
      } else {
        setMode("session");
        setName("");
        setNotes("");
        setSessionTime("");
        setStatus("planned");
      }
      setError(null);
    }
  }, [open, session, plan]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const trimmedName = name.trim();
    const trimmedNotes = notes.trim() || null;
    const trimmedTime = sessionTime.trim() || null;

    if (isEditing) {
      if (session) {
        const { error: err } = await supabase
          .from("workout_sessions")
          .update({
            name: trimmedName,
            notes: trimmedNotes,
            session_time: trimmedTime,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.id);
        if (err) { setError(err.message); setLoading(false); return; }
      } else if (plan) {
        const { error: err } = await supabase
          .from("workout_plans")
          .update({
            name: trimmedName,
            notes: trimmedNotes,
            session_time: trimmedTime,
            updated_at: new Date().toISOString(),
          })
          .eq("id", plan.id);
        if (err) { setError(err.message); setLoading(false); return; }
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("No autenticado"); setLoading(false); return; }

      if (mode === "session") {
        const { error: err } = await supabase.from("workout_sessions").insert({
          user_id: user.id,
          session_date: date,
          session_time: trimmedTime,
          name: trimmedName,
          notes: trimmedNotes,
          status,
          plan_id: null,
        });
        if (err) { setError(err.message); setLoading(false); return; }
      } else {
        const { error: err } = await supabase.from("workout_plans").insert({
          user_id: user.id,
          day_of_week: dayOfWeek,
          session_time: trimmedTime,
          name: trimmedName,
          notes: trimmedNotes,
        });
        if (err) { setError(err.message); setLoading(false); return; }
      }
    }

    setLoading(false);
    onOpenChange(false);
    onSuccess();
  }

  const title = isEditing
    ? session ? "Editar sesión" : "Editar plantilla"
    : "Agregar entrenamiento";

  const showStatus = mode === "session";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {!isEditing && (
          <div className="flex rounded-md border overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("session")}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                mode === "session"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Solo este día
            </button>
            <button
              type="button"
              onClick={() => setMode("plan")}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                mode === "plan"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Plantilla semanal
            </button>
          </div>
        )}

        {mode === "plan" && !isEditing && (
          <p className="text-sm text-muted-foreground">
            Se repetirá cada <strong>{DAY_NAMES[dayOfWeek]}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workout-name">Nombre</Label>
            <Input
              id="workout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "plan" ? "Ej: Pecho y tríceps" : "Ej: Carrera 5km"}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="workout-time">Hora (opcional)</Label>
              <Input
                id="workout-time"
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
              />
            </div>

            {showStatus && (
              <div className="space-y-2">
                <Label htmlFor="workout-status">Estado</Label>
                <select
                  id="workout-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WorkoutStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout-notes">Notas (opcional)</Label>
            <textarea
              id="workout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ejercicios, series, observaciones..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Guardando..." : isEditing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
