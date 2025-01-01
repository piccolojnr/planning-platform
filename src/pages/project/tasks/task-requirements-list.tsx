import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { toast } from "sonner";

type TaskRequirement = Database["public"]["Tables"]["task_requirements"]["Row"];

interface TaskRequirementsListProps {
  taskId: string;
  canEdit: boolean;
}

export function TaskRequirementsList({
  taskId,
  canEdit,
}: TaskRequirementsListProps) {
  const [requirements, setRequirements] = useState<TaskRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequirement, setNewRequirement] = useState("");
  const [addingRequirement, setAddingRequirement] = useState(false);

  useEffect(() => {
    loadRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  async function loadRequirements() {
    try {
      const { data, error } = await supabase
        .from("task_requirements")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at");

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error("Failed to load requirements", error);
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  }

  async function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!newRequirement.trim() || !canEdit) return;

    setAddingRequirement(true);
    try {
      const { error } = await supabase.from("task_requirements").insert({
        task_id: taskId,
        content: newRequirement.trim(),
      });

      if (error) throw error;

      setNewRequirement("");
      loadRequirements();
    } catch (error) {
      console.error("Failed to add requirement", error);
      toast.error("Failed to add requirement");
    } finally {
      setAddingRequirement(false);
    }
  }

  async function deleteRequirement(id: string) {
    if (!canEdit) return;

    try {
      const { error } = await supabase
        .from("task_requirements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRequirements((prev) =>
        prev.filter((requirement) => requirement.id !== id)
      );
      toast.success("Requirement deleted");
    } catch (error) {
      console.error("Failed to delete requirement", error);
      toast.error("Failed to delete requirement");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Requirements</h2>
      </div>

      <div className="space-y-2">
        {requirements.map((requirement) => (
          <div
            key={requirement.id}
            className="group flex items-center gap-2 rounded-lg border bg-card p-3"
          >
            <span className="flex-1 text-sm">{requirement.content}</span>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={() => deleteRequirement(requirement.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {canEdit && (
          <form onSubmit={addRequirement} className="flex gap-2">
            <Input
              placeholder="Add a new requirement..."
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              disabled={addingRequirement}
            />
            <Button type="submit" disabled={addingRequirement}>
              {addingRequirement ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}

        {requirements.length === 0 && (
          <p className="text-muted-foreground text-sm">No requirements added</p>
        )}
      </div>
    </div>
  );
}
