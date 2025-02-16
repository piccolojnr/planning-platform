import { forwardRef, Ref, useEffect, useState } from "react";
import {
  GripVertical,
  Clock,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
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
import { supabase } from "@/lib/supabase";

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
    const [dependencyTasks, setDependencyTasks] = useState<Task[]>([]);
    const [hasPendingDependencies, setHasPendingDependencies] = useState(false);

    useEffect(() => {
      if (Array.isArray(task.dependencies) && task.dependencies?.length) {
        loadDependencies();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task]);

    async function loadDependencies() {
      if (!task.dependencies) return;
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .in(
          "id",
          Array.isArray(task.dependencies) ? task.dependencies.map(String) : []
        );

      if (data) {
        setDependencyTasks(data);
        setHasPendingDependencies(data.some((t) => t.status !== "completed"));
      }
    }

    async function handleStatusChange(checked: boolean) {
      if (checked && hasPendingDependencies) {
        return;
      }
      onStatusChange(task.id, checked);
    }

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

        <div
          className="flex items-center gap-3"
          style={{ width: "calc(100% - 20px)" }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Checkbox
                  id={task.id}
                  checked={isCompleted}
                  onCheckedChange={handleStatusChange}
                  disabled={
                    !canEdit || (hasPendingDependencies && !isCompleted)
                  }
                  className={cn(
                    "mt-1 transition-colors",
                    isCompleted && "text-muted-foreground",
                    hasPendingDependencies && "cursor-not-allowed"
                  )}
                />
              </div>
            </TooltipTrigger>
            {hasPendingDependencies && (
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Complete dependencies first</span>
                </div>
              </TooltipContent>
            )}
          </Tooltip>

          <div className="flex-1 min-w-0">
            <Link
              to={`/dashboard/project/${task.project_id}/tasks/${task.id}`}
              className={cn(
                "block text-sm font-medium leading-none",
                "hover:underline focus-visible:outline-none focus-visible:underline",
                isCompleted &&
                  "text-muted-foreground line-through decoration-1",
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

              {dependencyTasks.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dependencyTasks.map((depTask) => (
                    <Link
                      key={depTask.id}
                      to={`/dashboard/project/${task.project_id}/tasks/${depTask.id}`}
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        depTask.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      )}
                    >
                      <LinkIcon className="h-3 w-3" />
                      {depTask.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

TaskItem.displayName = "TaskItem";
