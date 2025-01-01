import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SubTaskForm } from "./sub-task-form";

export const subTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});
export type SubTaskFormData = z.infer<typeof subTaskFormSchema>;

interface CreateSubTaskDialogProps {
  taskId: string;
  onFinished?: () => void;
}

export function CreateSubTaskDialog({
  taskId,
  onFinished,
}: CreateSubTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<SubTaskFormData>({
    resolver: zodResolver(subTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: SubTaskFormData) {
    setLoading(true);
    try {
      const { error } = await supabase.from("subtasks").insert({
        ...data,
        task_id: taskId,
      });
      if (error) {
        toast.error("Failed to create subtask");
        return;
      }
      onFinished?.();
      setOpen(false);
      form.reset();
      toast.success("Subtask created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create subtask");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Subtask</DialogTitle>
          <DialogDescription>
            Add a new subtask to your project.
          </DialogDescription>
        </DialogHeader>
        <SubTaskForm form={form} onSubmit={onSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  );
}
