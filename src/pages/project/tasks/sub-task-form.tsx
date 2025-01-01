import { UseFormReturn } from "react-hook-form";
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
import { SubTaskFormData } from "./create-subtask-dialog";
import { Loader2 } from "lucide-react";

interface SubTaskFormProps {
  form: UseFormReturn<SubTaskFormData>;
  onSubmit: (data: SubTaskFormData) => Promise<void>;
  loading: boolean;
}

export function SubTaskForm({ form, onSubmit, loading }: SubTaskFormProps) {
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
                <Input placeholder="Subtask title" {...field} />
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
                  placeholder="Describe the subtask..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            "Create Subtask"
          )}
        </Button>
      </form>
    </Form>
  );
}
