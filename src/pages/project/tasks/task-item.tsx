import { forwardRef, Ref } from "react";
import { GripVertical } from "lucide-react";
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "@hello-pangea/dnd";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/types/supabase";
import { Link } from "react-router-dom";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, completed: boolean) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  draggableProps?: DraggableProvidedDraggableProps;
  isDragging?: boolean;
  canEdit: boolean;
}

export const TaskItem = forwardRef<HTMLDivElement, TaskItemProps>(
  (
    {
      task,
      onStatusChange,
      dragHandleProps,
      draggableProps,
      isDragging,
      canEdit,
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const isCompleted = task.status === "completed";

    return (
      <div
        ref={ref}
        {...draggableProps}
        className={cn(
          "group relative flex items-start gap-3 rounded-lg border border-border p-4 bg-card transition-shadow",
          isDragging && "shadow-md opacity-70",
          !canEdit && "cursor-default"
        )}
      >
        {/* Drag handle (only visible when canEdit) */}
        {canEdit && (
          <div
            {...dragHandleProps}
            className="absolute -left-3 top-1/2 -translate-y-1/2 cursor-grab rounded-full bg-muted p-1 shadow hover:bg-muted/90 transition-opacity hidden group-hover:block"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        {/* Checkbox */}
        <Checkbox
          id={task.id}
          checked={isCompleted}
          onCheckedChange={(checked) =>
            onStatusChange(task.id, checked as boolean)
          }
          disabled={!canEdit}
          className="mt-[3px]"
        />

        {/* Text Content */}
        <div className="flex flex-col flex-1">
          {/* Title */}
          <Link
            to={`/project/${task.project_id}/tasks/${task.id}`}
            // htmlFor={task.id}
            className={cn(
              "text-sm font-medium cursor-pointer",
              isCompleted && "line-through text-muted-foreground",
              !canEdit && "cursor-default"
            )}
          >
            {task.title}
          </Link>

          {/* Description (optional, if you want to display it) */}
          {task.description && (
            <p
              className={cn(
                "mt-1 text-xs text-muted-foreground",
                isCompleted && "line-through"
              )}
            >
              {task.description}
            </p>
          )}

          {/* Example of extra metadata (duration, dependencies) */}
          <div className="mt-2 text-xs flex flex-wrap gap-2 text-muted-foreground">
            <span className="rounded bg-muted px-2 py-0.5">
              Duration: {task.duration} day{task.duration !== 1 ? "s" : ""}
            </span>
            {task.dependencies && task.dependencies.length > 0 && (
              <span className="rounded bg-muted px-2 py-0.5">
                Depends on: {task.dependencies.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

TaskItem.displayName = "TaskItem";
