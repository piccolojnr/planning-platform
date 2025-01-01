import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import RequirementItem from "./requirement-item";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Requirement = Database["public"]["Tables"]["requirements"]["Row"];

interface RequirementsListProps {
  projectId: string;
  canEdit: boolean;
}

export function RequirementsList({
  projectId,
  canEdit,
}: RequirementsListProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRequirement, setNewRequirement] = useState("");
  const [addingRequirement, setAddingRequirement] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadRequirements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadRequirements() {
    try {
      const { data, error } = await supabase
        .from("requirements")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setRequirements(data || []);
    } catch (error) {
      console.error("Failed to load requirements:", error);
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  }

  async function addRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!newRequirement.trim()) return;

    setAddingRequirement(true);
    try {
      const { error } = await supabase.from("requirements").insert({
        project_id: projectId,
        content: newRequirement.trim(),
      });

      if (error) throw error;

      setNewRequirement("");
      loadRequirements();
      toast.success("Requirement added");
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to add requirement:", error);
      toast.error("Failed to add requirement");
    } finally {
      setAddingRequirement(false);
    }
  }

  async function deleteRequirement(id: string) {
    try {
      const { error } = await supabase
        .from("requirements")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRequirements((prev) => prev.filter((req) => req.id !== id));
      toast.success("Requirement deleted");
    } catch (error) {
      console.error("Failed to delete requirement:", error);
      toast.error("Failed to delete requirement");
    }
  }

  async function updateRequirement(id: string, content: string) {
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from("requirements")
        .update({ content: content.trim() })
        .eq("id", id);

      if (error) throw error;

      setRequirements((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, content: content.trim() } : req
        )
      );
    } catch (error) {
      console.error("Failed to update requirement:", error);
      toast.error("Failed to update requirement");
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Requirements</h2>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground mb-2"
          >
            {isOpen ? "Hide" : "Show"}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-4">
        <div className="space-y-2">
          {requirements.map((requirement) => (
            <RequirementItem
              key={requirement.id}
              requirement={requirement}
              onDelete={deleteRequirement}
              onUpdate={updateRequirement}
              canEdit={canEdit}
            />
          ))}
        </div>
      </CollapsibleContent>
      {canEdit && (
        <form onSubmit={addRequirement} className="flex gap-2 mt-4">
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
              <PlusCircle className="h-4 w-4" />
            )}
          </Button>
        </form>
      )}

      {requirements.length === 0 && (
        <p className="text-muted-foreground text-sm mt-4">
          No requirements added
        </p>
      )}
    </Collapsible>
  );
}
