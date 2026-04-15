import { TASK_PRIORITIES, TASK_STATUSES, STATUS_LABELS, type TaskPriority, type TaskStatus } from "../types/task";

export interface TaskFormValue {
  title: string;
  description: string;
  project: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
}

interface TaskFormFieldsProps {
  value: TaskFormValue;
  onChange: (next: TaskFormValue) => void;
}

export function TaskFormFields({ value, onChange }: TaskFormFieldsProps) {
  const set = <K extends keyof TaskFormValue>(key: K, fieldValue: TaskFormValue[K]) => {
    onChange({ ...value, [key]: fieldValue });
  };

  return (
    <>
      <label>
        Title
        <input value={value.title} onChange={(event) => set("title", event.target.value)} required />
      </label>
      <label>
        Description
        <textarea value={value.description} onChange={(event) => set("description", event.target.value)} rows={4} />
      </label>
      <label>
        Project
        <input value={value.project} onChange={(event) => set("project", event.target.value)} />
      </label>
      <div className="task-form__row">
        <label>
          Status
          <select value={value.status} onChange={(event) => set("status", event.target.value as TaskStatus)}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select value={value.priority} onChange={(event) => set("priority", event.target.value as TaskPriority)}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Due date
        <input type="date" value={value.due_date} onChange={(event) => set("due_date", event.target.value)} />
      </label>
    </>
  );
}
