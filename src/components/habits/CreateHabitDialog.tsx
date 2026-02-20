"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Habit, HabitFrequency } from "@/lib/types";
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

interface CreateHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSuccess: () => void;
}

export function CreateHabitDialog({
  open,
  onOpenChange,
  habit,
  onSuccess,
}: CreateHabitDialogProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(
    habit?.frequency ?? "daily"
  );
  const [timesPerWeek, setTimesPerWeek] = useState<string>(
    habit?.times_per_week?.toString() ?? "3"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const isEditing = !!habit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      frequency,
      times_per_week: frequency === "custom" ? Number(timesPerWeek) : null,
      updated_at: new Date().toISOString(),
    };

    if (isEditing) {
      const { error } = await supabase
        .from("habits")
        .update(payload)
        .eq("id", habit.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No autenticado");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("habits").insert({
        ...payload,
        user_id: user.id,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onOpenChange(false);
    onSuccess();
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setName(habit?.name ?? "");
      setFrequency(habit?.frequency ?? "daily");
      setTimesPerWeek(habit?.times_per_week?.toString() ?? "3");
      setError(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar hábito" : "Nuevo hábito"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del hábito"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frecuencia</Label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="custom">N veces por semana</option>
            </select>
          </div>
          {frequency === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="times_per_week">Veces por semana</Label>
              <Input
                id="times_per_week"
                type="number"
                min={2}
                max={7}
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
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
