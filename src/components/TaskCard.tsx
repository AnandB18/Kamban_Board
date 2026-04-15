import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { getDueDateMeta } from "../utils/dueDate";
import type { Task } from "../types/task";

interface TaskCardProps {
  task: Task;
  onOpen: (taskId: string) => void;
  disabled?: boolean;
}

export function TaskCard({ task, onOpen, disabled = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { taskId: task.id, status: task.status },
    disabled,
  });

  const due = getDueDateMeta(task.due_date);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article ref={setNodeRef} style={style} className={`task-card ${isDragging ? "task-card--dragging" : ""}`}>
      <div className="task-card__header">
        <h4 className="task-card__title" onClick={() => onOpen(task.id)}>
          {task.title}
        </h4>
        <button
          type="button"
          className="task-card__drag-handle"
          aria-label="Drag task"
          title="Drag task"
          {...attributes}
          {...listeners}
        >
          ::: 
        </button>
      </div>
      <div className="task-card__meta">
        <span className={`due-badge due-badge--${due.bucket}`} title={due.tooltip ?? undefined}>
          {due.label}
        </span>
        {task.project ? <span className="task-card__project">{task.project}</span> : null}
      </div>
    </article>
  );
}
