import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "./lib/supabase";
import { createTask, deleteTask, fetchTasks, updateTask, updateTaskPositions } from "./api/tasks";
import { getDueDateMeta } from "./utils/dueDate";
import { TASK_STATUSES, type DueBucket, type Task, type TaskInput, type TaskPriority, type TaskStatus } from "./types/task";
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
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const dragOriginTasksRef = useRef<Task[] | null>(null);

  const sortByOrder = useCallback((list: Task[]) => {
    return [...list].sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, []);

  const columnTasks = useCallback(
    (source: Task[], status: TaskStatus) => sortByOrder(source.filter((task) => task.status === status)),
    [sortByOrder],
  );

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

  const moveTaskByDropTarget = useCallback(
    (source: Task[], activeId: string, overId: string): Task[] => {
      const activeTask = source.find((task) => task.id === activeId);
      if (!activeTask) return source;

      const overTask = source.find((task) => task.id === overId);
      const destinationStatus = TASK_STATUSES.includes(overId as TaskStatus)
        ? (overId as TaskStatus)
        : overTask?.status;
      if (!destinationStatus) return source;

      const sourceStatus = activeTask.status;
      const sourceColumn = columnTasks(source, sourceStatus);
      const destinationColumnBase =
        sourceStatus === destinationStatus ? sourceColumn : columnTasks(source, destinationStatus);

      const sourceIndex = sourceColumn.findIndex((task) => task.id === activeId);
      if (sourceIndex < 0) return source;

      if (sourceStatus === destinationStatus) {
        if (TASK_STATUSES.includes(overId as TaskStatus)) {
          const appendIndex = sourceColumn.length - 1;
          if (sourceIndex === appendIndex) return source;
          const reordered = arrayMove(sourceColumn, sourceIndex, appendIndex).map((task, index) => ({
            ...task,
            sort_order: (index + 1) * 1000,
          }));
          return source.map((task) => reordered.find((item) => item.id === task.id) ?? task);
        }

        const targetIndex = sourceColumn.findIndex((task) => task.id === overId);
        if (targetIndex < 0 || targetIndex === sourceIndex) return source;

        const reordered = arrayMove(sourceColumn, sourceIndex, targetIndex).map((task, index) => ({
          ...task,
          sort_order: (index + 1) * 1000,
        }));
        return source.map((task) => reordered.find((item) => item.id === task.id) ?? task);
      }

      const sourceWithoutActive = sourceColumn
        .filter((task) => task.id !== activeId)
        .map((task, index) => ({ ...task, sort_order: (index + 1) * 1000 }));

      const destinationColumn = destinationColumnBase.filter((task) => task.id !== activeId);
      const insertIndex = TASK_STATUSES.includes(overId as TaskStatus)
        ? destinationColumn.length
        : destinationColumn.findIndex((task) => task.id === overId);
      const nextInsertIndex = insertIndex < 0 ? destinationColumn.length : insertIndex;
      const movedTask = { ...activeTask, status: destinationStatus };

      const destinationWithMoved = [...destinationColumn];
      destinationWithMoved.splice(nextInsertIndex, 0, movedTask);
      const normalizedDestination = destinationWithMoved.map((task, index) => ({
        ...task,
        sort_order: (index + 1) * 1000,
      }));

      const updates = new Map<string, Task>();
      sourceWithoutActive.forEach((task) => updates.set(task.id, task));
      normalizedDestination.forEach((task) => updates.set(task.id, task));

      return source.map((task) => updates.get(task.id) ?? task);
    },
    [columnTasks],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id);
    setActiveDragTaskId(activeId);
    dragOriginTasksRef.current = tasks;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    const activeId = String(event.active.id);
    if (!overId || !activeId) return;

    const overValue = String(overId);
    setTasks((prev) => moveTaskByDropTarget(prev, activeId, overValue));
  };

  const handleDragCancel = () => {
    const originTasks = dragOriginTasksRef.current;
    if (originTasks) {
      setTasks(originTasks);
    }
    dragOriginTasksRef.current = null;
    setActiveDragTaskId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!userId) {
      handleDragCancel();
      return;
    }
    const overId = event.over?.id;
    const originTasks = dragOriginTasksRef.current ?? tasks;
    const finalTasks = !overId || !activeDragTaskId ? originTasks : tasks;
    setActiveDragTaskId(null);
    dragOriginTasksRef.current = null;

    if (!overId || !activeDragTaskId) {
      setTasks(originTasks);
      return;
    }

    const originById = new Map(originTasks.map((task) => [task.id, task]));
    const updates = finalTasks
      .filter((task) => {
        const original = originById.get(task.id);
        return original ? original.status !== task.status || original.sort_order !== task.sort_order : false;
      })
      .map((task) => ({ id: task.id, status: task.status, sort_order: task.sort_order }));

    if (updates.length === 0) return;

    try {
      await updateTaskPositions(userId, updates);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Failed to move task.";
      setError(message);
      setTasks(originTasks);
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
          tasks={sortByOrder(filteredTasks)}
          onDragStartTask={handleDragStart}
          onDragOverTask={handleDragOver}
          onDragCancelTask={handleDragCancel}
          onDragEndTask={handleDragEnd}
          onOpenTask={setSelectedTaskId}
          activeTaskId={activeDragTaskId}
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