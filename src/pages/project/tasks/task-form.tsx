import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TaskFormData } from "./create-task-dialog";
import { supabase } from "@/lib/supabase";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  form: UseFormReturn<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  projectId: string;
}

export function TaskForm({ form, onSubmit, projectId }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    form.getValues("dependencies") || []
  );

  useEffect(() => {
    async function loadTasks() {
      const { data } = await supabase
        .from("tasks")
        .select("id, title")
        .eq("project_id", projectId)
        .neq("id", form.getValues("id")); // Exclude current task if editing

      if (data) {
        setTasks(data);
      }
    }
    loadTasks();
  }, [projectId, form]);

  const handleSelect = (taskId: string) => {
    const updated = selectedTasks.includes(taskId)
      ? selectedTasks.filter((id) => id !== taskId)
      : [...selectedTasks, taskId];
    setSelectedTasks(updated);
    form.setValue("dependencies", updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the task..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Duration in days"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dependencies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dependencies</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {selectedTasks.length > 0
                        ? `${selectedTasks.length} selected`
                        : "Select dependencies"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search tasks..." />
                      <CommandEmpty>No tasks found.</CommandEmpty>
                      <CommandGroup>
                        {tasks.map((task) => (
                          <CommandItem
                            key={task.id}
                            onSelect={() => handleSelect(task.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedTasks.includes(task.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {task.title}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              {selectedTasks.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTasks.map((taskId) => {
                    const task = tasks.find((t) => t.id === taskId);
                    return (
                      <Badge key={taskId} variant="secondary" className="gap-1">
                        {task?.title}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleSelect(taskId)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {form.getValues("id") ? "Update" : "Create"} Task
        </Button>
      </form>
    </Form>
  );
}
