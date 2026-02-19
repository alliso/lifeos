# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture

**LifeOS** is a Next.js 14 (App Router) task management app backed by Supabase.

### Stack
- **Next.js 14** with App Router — server and client components, `force-dynamic` on protected pages
- **Supabase** — PostgreSQL database + auth (email/password, cookie-based sessions via `@supabase/ssr`)
- **Tailwind CSS + shadcn/ui** — CSS variable theming, components in `src/components/ui/`
- **@hello-pangea/dnd** — drag-and-drop on the kanban board
- **TypeScript** with path alias `@/*` → `src/*`

### Route Structure

```
/                         → redirects to /dashboard
/login                    → public, email/password auth
/(protected)/dashboard    → authenticated placeholder
/(protected)/tasks        → redirects to /tasks/board
/(protected)/tasks/board  → KanbanBoard component
/(protected)/tasks/backlog
/(protected)/tasks/archived
```

Middleware (`src/middleware.ts`) guards all routes: unauthenticated users are sent to `/login`; logged-in users hitting `/login` are redirected to `/dashboard`.

### Data Layer

- **`src/lib/supabase/client.ts`** — browser Supabase client (use in Client Components)
- **`src/lib/supabase/server.ts`** — server Supabase client (use in Server Components / Route Handlers)
- **`src/lib/types.ts`** — shared TypeScript types (e.g. `Task`)

Database table: `tasks` with columns `id`, `user_id`, `title`, `description`, `status`, `created_at`, `updated_at`, `completed_at`. Row-Level Security enforces `auth.uid() = user_id`.

Task status values: `'backlog' | 'todo' | 'active' | 'completed'`

### State Management

No external state library. Each component fetches its own data via `useEffect`/`useCallback` and applies optimistic updates before confirming with Supabase. Components accept an `onRefresh` callback to signal siblings to refetch.

### Environment

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The SQL schema (with RLS policies) is in `supabase-schema.sql` at the project root.
