import { useState, type FormEvent } from "react";
import { TaskFormFields, type TaskFormValue } from "./TaskFormFields";
import type { TaskInput } from "../types/task";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: TaskInput) => Promise<void>;
}

const EMPTY_FORM: TaskFormValue = {
  title: "",
  description: "",
  project: "",
  status: "todo",
  priority: "normal",
  due_date: "",
};

export function TaskModal({ open, onClose, onCreate }: TaskModalProps) {
  const [form, setForm] = useState<TaskFormValue>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        title: form.title,
        description: form.description || null,
        project: form.project || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date || null,
      });
      setForm(EMPTY_FORM);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" role="presentation">
      <div className="panel panel--modal">
        <div className="panel__header">
          <h2>Create task</h2>
          <button className="btn" onClick={onClose} type="button">
            Close
          </button>
        </div>
        <form className="task-form" onSubmit={handleSubmit}>
          <TaskFormFields value={form} onChange={setForm} />
          <div className="task-form__actions">
            <button className="btn" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
