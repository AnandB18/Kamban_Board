import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type Task, type TaskStatus } from "../types/task";
import { Column } from "./Column";

interface BoardProps {
  tasks: Task[];
  overStatus: TaskStatus | null;
  onDragOverStatus: (status: TaskStatus | null) => void;
  onDragEndTask: (event: DragEndEvent) => void;
  onOpenTask: (taskId: string) => void;
}

export function Board({ tasks, overStatus, onDragOverStatus, onDragEndTask, onOpenTask }: BoardProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const handleDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id;
    if (!overId) {
      onDragOverStatus(null);
      return;
    }
    const overValue = String(overId);
    if (TASK_STATUSES.includes(overValue as TaskStatus)) {
      onDragOverStatus(overValue as TaskStatus);
      return;
    }
    const overTask = tasks.find((task) => task.id === overValue);
    onDragOverStatus(overTask?.status ?? null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={onDragEndTask}
      onDragCancel={() => onDragOverStatus(null)}
    >
      <div className="board-scroll">
        <div className="board">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
              onOpenTask={onOpenTask}
              isOver={overStatus === status}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
