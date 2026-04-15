import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type Task, type TaskStatus } from "../types/task";
import { Column } from "./Column";
import { TaskCardPreview } from "./TaskCard";

interface BoardProps {
  tasks: Task[];
  overStatus: TaskStatus | null;
  onDragOverStatus: (status: TaskStatus | null) => void;
  onDragStartTask: (taskId: string | null) => void;
  onDragEndTask: (event: DragEndEvent) => void;
  onOpenTask: (taskId: string) => void;
  activeTaskId: string | null;
}

export function Board({
  tasks,
  overStatus,
  onDragOverStatus,
  onDragStartTask,
  onDragEndTask,
  onOpenTask,
  activeTaskId,
}: BoardProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const collisionDetection: CollisionDetection = (args) => {
    const pointerHits = pointerWithin(args);
    if (pointerHits.length > 0) return pointerHits;
    return closestCorners(args);
  };

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    onDragStartTask(String(event.active.id));
  };

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
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={onDragEndTask}
      onDragCancel={() => {
        onDragOverStatus(null);
        onDragStartTask(null);
      }}
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
      <DragOverlay>
        {activeTask ? <TaskCardPreview task={activeTask} onOpen={onOpenTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
