"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/client";
import type { WorkoutSession, WorkoutPlan, WorkoutStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<WorkoutStatus, string> = {
  reserved: "Reservado",
  completed: "Completado",
};

const STATUS_COLOR: Record<WorkoutStatus, string> = {
  reserved: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

interface WorkoutDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: WorkoutSession | null;
  plan?: WorkoutPlan | null;
  onRefresh: () => void;
}

export function WorkoutDetailDialog({
  open,
  onOpenChange,
  session,
  plan,
  onRefresh,
}: WorkoutDetailDialogProps) {
  const [tab, setTab] = useState<"preview" | "edit">("preview");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const currentNotes = session?.notes ?? plan?.notes ?? null;
  const title = session?.name ?? plan?.name ?? "";
  const sessionTime = session?.session_time ?? plan?.session_time ?? null;

  useEffect(() => {
    if (open) {
      setEditNotes(currentNotes ?? "");
      setTab("preview");
    }
  }, [open, currentNotes]);

  async function handleSave() {
    setSaving(true);
    const notes = editNotes.trim() || null;

    if (session) {
      await supabase
        .from("workout_sessions")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", session.id);
    } else if (plan) {
      await supabase
        .from("workout_plans")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", plan.id);
    }

    setSaving(false);
    onRefresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {session && (
              <span className="text-xs text-muted-foreground capitalize">
                {formatDate(session.session_date)}
              </span>
            )}
            {sessionTime && (
              <span className="text-xs text-muted-foreground">
                · {sessionTime.slice(0, 5)}
              </span>
            )}
            {session && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[session.status]}`}>
                {STATUS_LABEL[session.status]}
              </span>
            )}
            {plan && !session && (
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                Plantilla
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="pt-1">
          {/* Tab toggle */}
          <div className="flex rounded-md border overflow-hidden mb-4">
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                tab === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Notas
            </button>
            <button
              type="button"
              onClick={() => setTab("edit")}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                tab === "edit"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Editar
            </button>
          </div>

          {tab === "preview" && (
            <div className="min-h-[140px] rounded-md border bg-muted/30 px-3 py-2.5">
              {editNotes.trim() ? (
                <div className="text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:font-semibold [&_em]:italic [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground">
                  <ReactMarkdown>{editNotes}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Sin notas</p>
              )}
            </div>
          )}

          {tab === "edit" && (
            <div>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder={"Escribe en Markdown...\n\n**Pecho**\n- Press banca 4×8\n- Aperturas 3×12"}
                rows={7}
                autoFocus
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
