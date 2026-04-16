import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { TASK_STATUSES, type Task } from "../types/task";
import { Column } from "./Column";
import { TaskCardPreview } from "./TaskCard";

interface BoardProps {
  tasks: Task[];
  onDragStartTask: (event: DragStartEvent) => void;
  onDragOverTask: (event: DragOverEvent) => void;
  onDragCancelTask: () => void;
  onDragEndTask: (event: DragEndEvent) => void;
  onOpenTask: (taskId: string) => void;
  activeTaskId: string | null;
}

export function Board({
  tasks,
  onDragStartTask,
  onDragOverTask,
  onDragCancelTask,
  onDragEndTask,
  onOpenTask,
  activeTaskId,
}: BoardProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    onDragStartTask(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    onDragOverTask(event);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={onDragCancelTask}
      onDragEnd={onDragEndTask}
    >
      <div className="board-scroll">
        <div className="board-tile">
          <div className="board">
            {TASK_STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                onOpenTask={onOpenTask}
              />
            ))}
          </div>
        </div>
      </div>
      <DragOverlay>
        {activeTask ? <TaskCardPreview task={activeTask} onOpen={onOpenTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
