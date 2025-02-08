import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShareDialog } from "../../pages/project/share/share-dialog";
import { Trash } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectHeaderProps {
  project: Project & { role?: string };
  loading: boolean;
}

export function ProjectHeader({ project, loading }: ProjectHeaderProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  const deleteProject = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (error) throw error;

      toast.success("Project deleted");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete project", error);
      toast.error("Failed to delete project");
    }
  };

  const isOwner = !project.role;
  const canEdit = isOwner || project.role === "editor";

  return (
    <div className="flex items-center justify-between">
      <div>
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              {project.role && (
                <Badge variant="outline" className="capitalize">
                  {project.role}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {canEdit && <ShareDialog project={project} />}
        {isOwner && (
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteProject}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
