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
import { TaskForm } from "./task-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const taskFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  // duration in days string converted to number
  duration: z
    .string()
    .transform(Number)
    .refine((val) => val >= 1, {
      message: "Duration is required",
    }),
  // comma separated list of tasks names converted to array
  dependencies: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : [])),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

interface CreateTaskDialogProps {
  projectId: string;
}

export function CreateTaskDialog({ projectId }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      dependencies: [],
    },
  });

  async function onSubmit(data: TaskFormData) {
    try {
      const { error } = await supabase.from("tasks").insert({
        ...data,
        project_id: projectId,
      });

      if (error) throw error;

      toast.success("Task created successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to create task", error);
      toast.error("Failed to create task");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your project.</DialogDescription>
        </DialogHeader>
        <TaskForm projectId={projectId} form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
