import { useEffect, useState } from "react";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectCard } from "./project-card";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type SharedProject = Project & { role: string };

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        // Load owned projects
        const { data: ownedData, error: ownedError } = await supabase
          .from("projects")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (ownedError) {
          console.error("Failed to load projects", ownedError);
          toast.error("Failed to load projects");
          return;
        }

        // Load shared projects
        const { data: sharedData, error: sharedError } = await supabase
          .from("shared_projects")
          .select("project_id, role, project:projects(*)")
          .eq("user_id", user?.id);

        if (sharedError) {
          console.error("Failed to load shared projects", sharedError);
          toast.error("Failed to load shared projects");
          return;
        }

        setProjects(ownedData || []);
        setSharedProjects(
          (sharedData || []).map(
            (share) =>
              ({
                ...share.project,
                role: share.role,
              } as any)
          )
        );
      } catch (error) {
        console.error("Failed to load projects", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    const channel = supabase
      .channel("projects")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          loadProjects();
        }
      )
      .subscribe();

    loadProjects();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Create and manage your AI-powered project plans
          </p>
        </div>
        <CreateProjectDialog />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={48} className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
          {sharedProjects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Shared With You</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sharedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    role={project.role}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
