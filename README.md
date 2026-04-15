# Kanban MVP

Dark-themed Kanban board built with React, TypeScript, Supabase, and dnd-kit.

## Features

- Guest session auto-created via Supabase anonymous auth
- Four Kanban columns: To Do, In Progress, In Review, Done
- Create tasks in a modal
- Edit and delete tasks in a side drawer
- Drag-and-drop status updates with optimistic UI and rollback on failure
- Due-date urgency badges:
  - Overdue: red
  - Due today: orange
  - Upcoming (1-7 days): yellow
  - Later / No due date: gray
- Top-bar search and filters (title, project, priority, due bucket)
- Responsive horizontal board scrolling

## Stack

- React + TypeScript + Vite
- `@supabase/supabase-js`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

## Local Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` from `.env.example` and set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run:
   - `npm run dev`

## Database and RLS

Run [supabase/schema.sql](supabase/schema.sql) in Supabase SQL editor. This creates the `tasks` table and RLS policies so users only access rows where `user_id = auth.uid()`.

Also ensure Supabase Anonymous Auth is enabled in `Authentication -> Providers`.

## Scripts

- `npm run dev` - Start local dev server
- `npm run lint` - Run ESLint
- `npm run build` - Production build

## Deploy (Vercel)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy and copy the live URL into your final deliverable document.
