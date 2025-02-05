import { useEffect, useState, useCallback } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CreateTaskDialog } from "./create-task-dialog";
import { AlertCircle } from "lucide-react";
import { TaskItem } from "./task-item";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  loading: boolean;
  canEdit: boolean;
}

export function TaskList({
  projectId,
  tasks: initialTasks,
  canEdit,
}: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const updateTaskOrder = useCallback(
    async (updatedTasks: Task[]) => {
      const updates = updatedTasks.map((task, index) => ({
        id: task.id,
        title: task.title,
        project_id: projectId,
        order: index,
      }));

      const { error } = await supabase
        .from("tasks")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;
    },
    [projectId]
  );

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination || !canEdit) return;

      try {
        setError(null);
        const newTasks = Array.from(tasks);
        const [removed] = newTasks.splice(result.source.index, 1);
        newTasks.splice(result.destination.index, 0, removed);

        setTasks(newTasks);
        await updateTaskOrder(newTasks);
      } catch (err) {
        setError("Failed to update task order. Please try again.");
        toast.error("Failed to update task order");
        console.error("Task reorder error:", err);
      }
    },
    [tasks, canEdit, updateTaskOrder]
  );

  const toggleTaskStatus = useCallback(
    async (taskId: string, completed: boolean) => {
      if (!canEdit) return;

      try {
        setError(null);
        const { error } = await supabase
          .from("tasks")
          .update({ status: completed ? "completed" : "pending" })
          .eq("id", taskId);

        if (error) throw error;

        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: completed ? "completed" : "pending" }
              : task
          )
        );
      } catch (err) {
        setError("Failed to update task status. Please try again.");
        toast.error("Failed to update task status");
        console.error("Task status update error:", err);
      }
    },
    [canEdit]
  );

  const sortedTasks = tasks.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold tracking-tight">Tasks</h2>
        {canEdit && <CreateTaskDialog projectId={projectId} />}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <p>No tasks available</p>
          {canEdit && (
            <p className="text-sm mt-2">
              Click the "Add Task" button to create your first task
            </p>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks" isDropDisabled={!canEdit}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {sortedTasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                    isDragDisabled={!canEdit}
                  >
                    {(provided, snapshot) => (
                      <TaskItem
                        task={task}
                        onStatusChange={toggleTaskStatus}
                        dragHandleProps={provided.dragHandleProps as any}
                        draggableProps={provided.draggableProps}
                        ref={provided.innerRef}
                        isDragging={snapshot.isDragging}
                        canEdit={canEdit}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
