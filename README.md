# LifeOS

Aplicación personal de gestión de tareas construida con Next.js y Supabase.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** — base de datos PostgreSQL + autenticación
- **Tailwind CSS** + **shadcn/ui**
- **@hello-pangea/dnd** — drag & drop en el tablero kanban

## Requisitos previos

- Node.js 18+
- Un proyecto en [Supabase](https://supabase.com)

## Configuración

1. Clona el repositorio e instala dependencias:

   ```bash
   npm install
   ```

2. Crea el archivo `.env.local` en la raíz del proyecto:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
   ```

3. Ejecuta el schema SQL en el editor de Supabase (sección *SQL Editor*):

   ```sql
   -- supabase-schema.sql
   CREATE TABLE tasks (
     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     title        TEXT NOT NULL,
     description  TEXT,
     status       TEXT NOT NULL DEFAULT 'backlog',
     created_at   TIMESTAMPTZ DEFAULT NOW(),
     updated_at   TIMESTAMPTZ DEFAULT NOW(),
     completed_at TIMESTAMPTZ
   );

   ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Cada usuario solo ve sus tareas"
     ON tasks FOR ALL
     USING (auth.uid() = user_id);
   ```

4. Habilita el proveedor **Email** en *Authentication → Providers* de Supabase y crea un usuario de prueba.

## Desarrollo

```bash
npm run dev    # Servidor de desarrollo en http://localhost:3000
npm run build  # Build de producción
npm run lint   # Linter
```

## Funcionalidades

- Autenticación con email y contraseña
- Tablero kanban con columnas: **Backlog → To Do → En curso → Completado**
- Drag & drop para mover tareas entre columnas
- Vista de backlog y tareas archivadas
- Cada usuario solo ve sus propias tareas (Row-Level Security)
