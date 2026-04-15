import { useCallback, useEffect, useMemo, useState } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { supabase } from "./lib/supabase";
import { createTask, deleteTask, fetchTasks, updateTask, updateTaskStatus } from "./api/tasks";
import { getDueDateMeta } from "./utils/dueDate";
import type { DueBucket, Task, TaskInput, TaskPriority, TaskStatus } from "./types/task";
import { Board } from "./components/Board";
import { TopBar } from "./components/TopBar";
import { TaskModal } from "./components/TaskModal";
import { TaskDrawer } from "./components/TaskDrawer";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [projectQuery, setProjectQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [dueFilter, setDueFilter] = useState<"all" | DueBucket>("all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        const { error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) throw anonErr;
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!userData.user) throw new Error("Could not create guest session.");

      setUserId(userData.user.id);
      const rows = await fetchTasks(userData.user.id);
      setTasks(rows);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to load board.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const filteredTasks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    const projectValue = projectQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const dueMeta = getDueDateMeta(task.due_date);
      const matchesSearch = !searchValue || task.title.toLowerCase().includes(searchValue);
      const matchesProject = !projectValue || (task.project ?? "").toLowerCase().includes(projectValue);
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      const matchesDue = dueFilter === "all" || dueMeta.bucket === dueFilter;
      return matchesSearch && matchesProject && matchesPriority && matchesDue;
    });
  }, [tasks, search, projectQuery, priorityFilter, dueFilter]);

  const selectedTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) ?? null : null;

  const handleCreate = async (input: TaskInput) => {
    if (!userId) return;
    setError(null);
    try {
      const created = await createTask(userId, input);
      setTasks((prev) => [created, ...prev]);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to create task.";
      setError(message);
      throw caught;
    }
  };

  const handleSave = async (taskId: string, updates: Partial<TaskInput>) => {
    if (!userId) return;
    setError(null);
    try {
      const saved = await updateTask(userId, taskId, updates);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? saved : task)));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to save task.";
      setError(message);
      throw caught;
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!userId) return;
    setError(null);
    try {
      await deleteTask(userId, taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to delete task.";
      setError(message);
      throw caught;
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!userId) return;
    setOverStatus(null);
    const overId = event.over?.id;
    if (!overId) return;

    const taskId = String(event.active.id);
    const nextStatus = String(overId) as TaskStatus;
    const target = tasks.find((task) => task.id === taskId);
    if (!target || target.status === nextStatus) return;

    const previousStatus = target.status;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: nextStatus } : task)));
    try {
      const updated = await updateTaskStatus(userId, taskId, nextStatus);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? updated : task)));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to move task.";
      setError(message);
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: previousStatus } : task)));
    }
  };

  return (
    <main className="app-shell">
      <TopBar
        search={search}
        onSearchChange={setSearch}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        dueBucket={dueFilter}
        onDueBucketChange={setDueFilter}
        projectQuery={projectQuery}
        onProjectQueryChange={setProjectQuery}
        onCreateClick={() => setTaskModalOpen(true)}
      />
      {error ? <p className="feedback feedback--error">{error}</p> : null}
      {loading ? <p className="feedback">Loading board...</p> : null}
      {!loading && filteredTasks.length === 0 ? <p className="feedback">No tasks match your filters.</p> : null}
      {!loading ? (
        <Board
          tasks={filteredTasks}
          overStatus={overStatus}
          onDragOverStatus={setOverStatus}
          onDragEndTask={handleDragEnd}
          onOpenTask={setSelectedTaskId}
        />
      ) : null}
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onCreate={handleCreate} />
      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </main>
  );
}