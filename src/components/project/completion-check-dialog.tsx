import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CompletionCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  incompleteTasks: {
    taskId: string;
    taskTitle: string;
    subtasks: { id: string; title: string }[];
  }[];
  onComplete: () => void;
}

export function CompletionCheckDialog({
  open,
  onOpenChange,
  projectId,
  incompleteTasks,
  onComplete,
}: CompletionCheckDialogProps) {
  const [loading, setLoading] = useState(false);

  if (incompleteTasks.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <DialogTitle>Congratulations! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              All tasks and subtasks are completed! Great job on finishing your
              project.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  async function handleMarkAllComplete() {
    setLoading(true);
    try {
      // Update all incomplete tasks
      const taskUpdates = incompleteTasks.map((task) => ({
        id: task.taskId,
        project_id: projectId,
        status: "completed",
        title: task.taskTitle,
      }));

      // Update all incomplete subtasks
      const subtaskUpdates = incompleteTasks.flatMap((task) =>
        task.subtasks.map((subtask) => ({
          id: subtask.id,
          status: "completed",
          title: subtask.title,
        }))
      );

      const [taskResult, subtaskResult] = await Promise.all([
        supabase.from("tasks").upsert(taskUpdates),
        supabase.from("subtasks").upsert(subtaskUpdates),
      ]);

      if (taskResult.error) throw taskResult.error;
      if (subtaskResult.error) throw subtaskResult.error;

      toast.success("All items marked as complete");
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to mark items complete:", error);
      toast.error("Failed to mark items complete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Incomplete Items</DialogTitle>
          <DialogDescription>
            The following tasks and subtasks are still incomplete:
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {incompleteTasks.map((task) => (
              <div key={task.taskId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox checked={false} disabled />
                  <span className="font-medium">{task.taskTitle}</span>
                  {task.subtasks.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {task.subtasks.length} subtask
                      {task.subtasks.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                </div>
                {task.subtasks.length > 0 && (
                  <div className="ml-6 space-y-2 border-l pl-4">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Checkbox checked={false} disabled />
                        <span className="text-sm text-muted-foreground">
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleMarkAllComplete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark All Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
