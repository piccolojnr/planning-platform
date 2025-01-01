import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { CreateSubTaskDialog } from "./create-subtask-dialog";
import { SubTaskItem } from "./sub-task-item.";

type Subtask = Database["public"]["Tables"]["subtasks"]["Row"];

interface SubtaskListProps {
  taskId: string;
  canEdit: boolean;
}

export function SubtaskList({ taskId, canEdit }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubtasks();
    const channel = supabase
      .channel("subtasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subtasks",
        },
        () => {
          loadSubtasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  async function loadSubtasks() {
    try {
      const { data, error } = await supabase
        .from("subtasks")
        .select("*")
        .eq("task_id", taskId)
        .order("order");

      if (error) throw error;
      setSubtasks(data || []);
    } catch (error) {
      console.error("Failed to load subtasks", error);
      toast.error("Failed to load subtasks");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSubtask(id: string) {
    if (!canEdit) return;

    try {
      const { error } = await supabase.from("subtasks").delete().eq("id", id);

      if (error) throw error;

      setSubtasks((prev) => prev.filter((subtask) => subtask.id !== id));
      toast.success("Subtask deleted");
    } catch (error) {
      console.error("Failed to delete subtask", error);
      toast.error("Failed to delete subtask");
    }
  }

  async function toggleStatus(id: string, completed: boolean) {
    if (!canEdit) return;

    try {
      const { error } = await supabase
        .from("subtasks")
        .update({ status: completed ? "completed" : "pending" })
        .eq("id", id);

      if (error) throw error;

      setSubtasks((prev) =>
        prev.map((subtask) =>
          subtask.id === id
            ? {
                ...subtask,
                status: completed ? "completed" : "pending",
                order: completed ? prev.length : subtask.order,
              }
            : subtask
        )
      );
    } catch (error) {
      console.error("Failed to update subtask status", error);
      toast.error("Failed to update subtask status");
    }
  }

  async function onDragEnd(result: any) {
    if (!result.destination || !canEdit) return;

    const newItems = Array.from(subtasks);
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);

    const updates = newItems.map((subtask, index) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.description,
      task_id: taskId,
      order: index,
    }));

    try {
      setSubtasks(newItems);

      const { error } = await supabase.from("subtasks").upsert(updates, {
        onConflict: "id",
      });

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update subtask order", error);
      toast.error("Failed to update subtask order");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }
  const subtTasksOrdered = subtasks.sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="subtasks" isDropDisabled={!canEdit}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {subtTasksOrdered.map((subtask, index) => (
                <Draggable
                  key={subtask.id}
                  draggableId={subtask.id}
                  index={index}
                  isDragDisabled={!canEdit}
                >
                  {(provided, snapshot) => (
                    <SubTaskItem
                      onStatusChange={toggleStatus}
                      subTask={subtask}
                      dragHandleProps={provided.dragHandleProps as any}
                      draggableProps={provided.draggableProps}
                      ref={provided.innerRef}
                      isDragging={snapshot.isDragging}
                      canEdit={canEdit}
                      onDelete={() => deleteSubtask(subtask.id)}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {canEdit && <CreateSubTaskDialog taskId={taskId} />}

      {subtasks.length === 0 && (
        <p className="text-muted-foreground text-sm">No subtasks added</p>
      )}
    </div>
  );
}
