import { supabase } from "../lib/supabase";
import type { Task, TaskInput, TaskStatus } from "../types/task";

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Task[];
}

export async function createTask(userId: string, input: TaskInput): Promise<Task> {
  const now = Date.now();
  const payload = {
    user_id: userId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    project: input.project?.trim() || null,
    status: input.status ?? "todo",
    priority: input.priority ?? "normal",
    due_date: input.due_date || null,
    sort_order: now,
  };

  const { data, error } = await supabase.from("tasks").insert(payload).select("*").single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(userId: string, id: string, updates: Partial<TaskInput>): Promise<Task> {
  const payload = {
    ...updates,
    title: updates.title?.trim(),
    description: updates.description?.trim() || updates.description === "" ? null : updates.description,
    project: updates.project?.trim() || updates.project === "" ? null : updates.project,
    due_date: updates.due_date || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTaskStatus(userId: string, id: string, status: TaskStatus): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Task;
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function updateTaskPositions(
  userId: string,
  updates: Array<{ id: string; status: TaskStatus; sort_order: number }>,
): Promise<void> {
  const now = new Date().toISOString();
  await Promise.all(
    updates.map(async (update) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: update.status, sort_order: update.sort_order, updated_at: now })
        .eq("id", update.id)
        .eq("user_id", userId);
      if (error) throw error;
    }),
  );
}
