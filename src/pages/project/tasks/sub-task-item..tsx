import { forwardRef, Ref } from "react";
import { GripVertical, X } from "lucide-react";
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "@hello-pangea/dnd";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/types/supabase";

type SubTask = Database["public"]["Tables"]["subtasks"]["Row"];

interface SubTaskItemProps {
  subTask: SubTask;
  onStatusChange: (id: string, completed: boolean) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  draggableProps?: DraggableProvidedDraggableProps;
  isDragging?: boolean;
  canEdit: boolean;
  onDelete: (id: string) => void;
}

export const SubTaskItem = forwardRef<HTMLDivElement, SubTaskItemProps>(
  (
    {
      subTask: task,
      onStatusChange,
      dragHandleProps,
      draggableProps,
      isDragging,
      canEdit,
      onDelete,
    },
    ref: Ref<HTMLDivElement>
  ) => {
    const isCompleted = task.status === "completed";

    return (
      <div
        ref={ref}
        {...draggableProps}
        className={cn(
          "group relative flex items-center justify-between gap-3 rounded-lg border border-border p-4 bg-card transition-shadow",
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

        <div
          className="flex items-center gap-3"
          style={{ width: "calc(100% - 20px)" }}
        >
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
            <label
              htmlFor={task.id}
              className={cn(
                "text-sm font-medium cursor-pointer",
                isCompleted && "line-through text-muted-foreground",
                !canEdit && "cursor-default"
              )}
            >
              {task.title}
            </label>

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
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SubTaskItem.displayName = "TaskItem";
