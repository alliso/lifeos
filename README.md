# LifeOS

> Tu sistema operativo personal — gestiona tareas, hábitos y proyectos en un solo lugar.

Aplicación web construida con **Next.js 14** y **Supabase**, diseñada para ser rápida, privada y completamente tuya.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Base de datos y Auth | Supabase (PostgreSQL + RLS) |
| Estilos | Tailwind CSS + shadcn/ui |
| Drag & drop | @hello-pangea/dnd |

---

## Primeros pasos

### Requisitos

- Node.js 18+
- Una cuenta en [Supabase](https://supabase.com) (plan gratuito es suficiente)

### Instalación

**1. Clona e instala dependencias**

```bash
git clone <url-del-repo>
cd lifeos
npm install
```

**2. Configura las variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

Puedes encontrar estos valores en tu proyecto de Supabase bajo *Settings → API*.

**3. Crea la base de datos**

En el *SQL Editor* de Supabase, ejecuta el contenido de `supabase-schema.sql` (incluido en el repo). Esto crea la tabla `tasks` con Row-Level Security habilitado.

**4. Activa la autenticación por email**

En Supabase ve a *Authentication → Providers*, habilita **Email** y crea un usuario de prueba.

**5. Arranca el servidor**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Desarrollo local (sin cuenta en Supabase)

Puedes correr toda la pila localmente usando la **Supabase CLI** y Docker, sin necesidad de una cuenta en la nube.

### Requisitos adicionales

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) corriendo

### Configuración

**1. Instala la Supabase CLI**

```bash
brew install supabase/tap/supabase
```

**2. Arranca Supabase local**

```bash
supabase start
```

La primera vez descarga las imágenes Docker (~5 min). Al terminar imprime las URLs y claves locales:

```
Project URL: http://127.0.0.1:54321
Publishable:  sb_publishable_...
```

**3. Actualiza `.env.local`** con esos valores:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key del output>
```

**4. Arranca la app**

```bash
npm run dev
```

### Comandos útiles

```bash
supabase stop    # Detener instancia local
supabase start   # Volver a arrancar (rápido — imágenes ya descargadas)
supabase status  # Ver URLs y claves actuales
supabase studio  # Abrir Supabase Studio en el navegador (UI de la BD)
```

Supabase Studio estará disponible en [http://127.0.0.1:54323](http://127.0.0.1:54323).

---

## Comandos disponibles

```bash
npm run dev    # Servidor de desarrollo
npm run build  # Build de producción
npm run lint   # Comprobación de código con ESLint
```

---

## Funcionalidades

### Tareas

- **Tablero Kanban** con tres columnas: _Por hacer_, _Activo_ y _Finalizado_
- **Drag & drop** para mover tareas entre columnas
- **Backlog** para aparcar tareas sin prioridad; se mueven al tablero cuando estés listo
- **Archivados** — las tareas completadas hace más de 7 días se guardan aquí automáticamente
- **Fecha límite** — se muestra en rojo con alerta si la tarea está vencida
- Botón **"+"** en cada columna para crear una tarea directamente en ese estado
- Cada tarea puede tener título, descripción y fecha límite
- Menú de opciones en cada tarjeta: editar, mover o eliminar

### Hábitos

- **Lista de hábitos** con soporte para frecuencia diaria, semanal o personalizada (_N veces por semana_)
- **Marcar hábito del día** con un solo clic; el botón se pone verde al completarlo
- **Racha (streak)** automática — se calcula solo según los días o semanas que hayas cumplido el hábito
- Historial de los últimos 90 días para calcular rachas largas
