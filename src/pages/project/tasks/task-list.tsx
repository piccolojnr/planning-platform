import { useEffect, useState } from "react";
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
import { TaskItem } from "./task-item";
import { Loader2 } from "lucide-react";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  loading: boolean;
  canEdit: boolean;
}

export function TaskList({
  projectId,
  tasks,
  loading,
  canEdit,
}: TaskListProps) {
  const [items, setItems] = useState(tasks);

  useEffect(() => {
    setItems(tasks);
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !canEdit) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);

    const updates = newItems.map((task, index) => ({
      id: task.id,
      title: task.title,
      project_id: projectId,
      order: index,
    }));

    try {
      setItems(newItems);

      const { error } = await supabase.from("tasks").upsert(updates, {
        onConflict: "id",
      });

      if (error) throw error;
      setItems(newItems);
    } catch (error) {
      console.error("Failed to update task order:", error);
      toast.error("Failed to update task order");
    }
  };

  const toggleStatus = async (taskId: string, completed: boolean) => {
    if (!canEdit) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: completed ? "completed" : "pending" })
        .eq("id", taskId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: completed ? "completed" : "pending",
                order: completed ? prev.length : 0,
              }
            : task
        )
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  const tasksOrdered = items.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tasks</h2>
        {canEdit && <CreateTaskDialog projectId={projectId} />}
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={48} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No tasks available</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks" isDropDisabled={!canEdit}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {tasksOrdered.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                    isDragDisabled={!canEdit}
                  >
                    {(provided, snapshot) => (
                      <TaskItem
                        task={task}
                        onStatusChange={toggleStatus}
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
