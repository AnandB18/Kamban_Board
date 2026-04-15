import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { STATUS_LABELS, type Task, type TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";

interface ColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onOpenTask: (taskId: string) => void;
  isOver?: boolean;
}

export function Column({ status, tasks, onOpenTask, isOver = false }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className={`column ${isOver ? "column--over" : ""}`}>
      <header className={`column__header column__header--${status}`}>
        <h3>{STATUS_LABELS[status]}</h3>
        <span>{tasks.length}</span>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="column__content">
          {tasks.length === 0 ? <p className="column__empty">No tasks yet</p> : null}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}
