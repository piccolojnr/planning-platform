import { forwardRef, Ref } from "react";
import { GripVertical, Clock, Link as LinkIcon } from "lucide-react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/types/supabase";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskItemProps {
  task: Task;
  onStatusChange: (id: string, completed: boolean) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps;
  draggableProps?: any;
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
          "group relative flex items-start gap-4 rounded-lg border p-4",
          "bg-card transition-all duration-200 hover:shadow-sm",
          isDragging && "shadow-lg opacity-90",
          !canEdit && "cursor-default",
          isCompleted && "bg-muted/50"
        )}
      >
        {canEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...dragHandleProps}
                className={cn(
                  "absolute -left-3 top-1/2 -translate-y-1/2",
                  "cursor-grab rounded-full bg-muted p-1.5 shadow-sm",
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  "hover:bg-muted/90 active:cursor-grabbing"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>Drag to reorder</TooltipContent>
          </Tooltip>
        )}

        <Checkbox
          id={task.id}
          checked={isCompleted}
          onCheckedChange={(checked) =>
            onStatusChange(task.id, checked as boolean)
          }
          disabled={!canEdit}
          className={cn(
            "mt-1 transition-colors",
            isCompleted && "text-muted-foreground"
          )}
        />

        <div className="flex-1 min-w-0">
          <Link
            to={`/project/${task.project_id}/tasks/${task.id}`}
            className={cn(
              "block text-sm font-medium leading-none",
              "hover:underline focus-visible:outline-none focus-visible:underline",
              isCompleted && "text-muted-foreground line-through decoration-1",
              !canEdit && "pointer-events-none"
            )}
          >
            {task.title}
          </Link>

          {task.description && (
            <p
              className={cn(
                "mt-2 text-sm text-muted-foreground line-clamp-2",
                isCompleted && "line-through decoration-1"
              )}
            >
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {task.duration && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  "rounded-full bg-muted px-2 py-0.5",
                  "text-xs font-medium text-muted-foreground"
                )}
              >
                <Clock className="h-3 w-3" />
                {task.duration} day{task.duration !== 1 ? "s" : ""}
              </span>
            )}

            {Array.isArray(task.dependencies) &&
              task.dependencies.length > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5",
                    "rounded-full bg-muted px-2 py-0.5",
                    "text-xs font-medium text-muted-foreground"
                  )}
                >
                  <LinkIcon className="h-3 w-3" />
                  {task.dependencies.length} dependenc
                  {task.dependencies.length === 1 ? "y" : "ies"}
                </span>
              )}
          </div>
        </div>
      </div>
    );
  }
);

TaskItem.displayName = "TaskItem";
