import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido a LifeOS</h1>
        {user?.email && (
          <p className="mt-2 text-muted-foreground">{user.email}</p>
        )}
        <p className="mt-6 text-muted-foreground">
          Tu sistema personal de gestión de vida. Usa la barra lateral para navegar.
        </p>
      </div>
    </div>
  );
}
