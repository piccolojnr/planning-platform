import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { X } from "lucide-react";
import { useState } from "react";

type Requirement = Database["public"]["Tables"]["requirements"]["Row"];

interface RequirementItemProps {
  requirement: Requirement;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
  canEdit: boolean;
}

export default function RequirementItem({
  requirement,
  onDelete,
  onUpdate,
  canEdit,
}: RequirementItemProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(requirement.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content?.trim()) return;
    onUpdate(requirement.id, content);
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg border bg-card p-3",
        canEdit && "hover:border-primary/50"
      )}
    >
      {editing ? (
        <form onSubmit={handleSubmit} className="flex-1">
          <Input
            value={content || ""}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSubmit}
            autoFocus
          />
        </form>
      ) : (
        <div
          className={cn(
            "flex-1 text-sm",
            canEdit && "cursor-pointer hover:text-primary"
          )}
          onClick={() => canEdit && setEditing(true)}
        >
          {requirement.content}
        </div>
      )}

      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
          onClick={() => onDelete(requirement.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
