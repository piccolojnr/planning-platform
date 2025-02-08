import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShareFormData } from "./share-dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ShareFormProps {
  form: UseFormReturn<ShareFormData>;
  projectId: string;
}

export function ShareForm({ form, projectId }: ShareFormProps) {
  const [loading, setLoading] = useState(false);
  async function onSubmit(data: ShareFormData) {
    setLoading(true);
    try {
      // Get user by email
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", data.email)
        .single();

      if (userError || !users || !users.id) throw new Error("User not found");

      // Share project
      const { error: shareError } = await supabase
        .from("shared_projects")
        .insert({
          project_id: projectId,
          user_id: users.id,
          role: data.role,
        });

      if (shareError) {
        throw shareError;
      }

      toast.success("Project shared successfully");
      form.reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Share"}
        </Button>
      </form>
    </Form>
  );
}
