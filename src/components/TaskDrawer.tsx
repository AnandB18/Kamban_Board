import { useEffect, useState, type FormEvent } from "react";
import { getDueDateMeta } from "../utils/dueDate";
import type { Task, TaskInput } from "../types/task";
import { TaskFormFields, type TaskFormValue } from "./TaskFormFields";

interface TaskDrawerProps {
  task: Task | null;
  onSave: (taskId: string, updates: Partial<TaskInput>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

function toForm(task: Task): TaskFormValue {
  return {
    title: task.title,
    description: task.description ?? "",
    project: task.project ?? "",
    status: task.status,
    priority: task.priority,
    due_date: task.due_date ?? "",
  };
}

export function TaskDrawer({ task, onSave, onDelete }: TaskDrawerProps) {
  const [form, setForm] = useState<TaskFormValue | null>(task ? toForm(task) : null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setForm(task ? toForm(task) : null);
  }, [task]);

  if (!task || !form) {
    return (
      <aside className="drawer" aria-label="Task details">
        <div className="panel panel--drawer">
          <div className="panel__header">
            <h2>Task details</h2>
          </div>
          <p className="drawer__empty">Select a card to view and edit details.</p>
        </div>
      </aside>
    );
  }

  const due = getDueDateMeta(task.due_date, task.status);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(task.id, {
        title: form.title,
        description: form.description || null,
        project: form.project || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <aside className="drawer" aria-label="Task details">
      <div className="panel panel--drawer">
        <div className="panel__header">
          <h2>Task details</h2>
        </div>
        <div className="drawer__meta">
          <span className={`due-badge due-badge--${due.bucket}`} title={due.tooltip ?? undefined}>
            {due.label}
          </span>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <TaskFormFields value={form} onChange={setForm} />
          <div className="task-form__actions">
            <button className="btn btn--danger" type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
