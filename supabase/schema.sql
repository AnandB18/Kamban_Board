create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  project text,
  status text not null default 'todo',
  priority text not null default 'normal',
  due_date date,
  sort_order double precision not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_status_check check (status in ('todo', 'in_progress', 'in_review', 'done')),
  constraint tasks_priority_check check (priority in ('low', 'normal', 'high'))
);

alter table public.tasks add column if not exists sort_order double precision not null default 1000;

alter table public.tasks enable row level security;

drop policy if exists tasks_select_own on public.tasks;
create policy tasks_select_own
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists tasks_insert_own on public.tasks;
create policy tasks_insert_own
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists tasks_update_own on public.tasks;
create policy tasks_update_own
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists tasks_delete_own on public.tasks;
create policy tasks_delete_own
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);
