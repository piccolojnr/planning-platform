import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "./project-header";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { TaskList } from "./tasks/task-list";
import { useAuth } from "@/contexts/auth";
import { RequirementsList } from "./requirements/requirements-list";
import { Separator } from "@/components/ui/separator";
import { ChatInterface } from "./chat/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Seo } from "@/components/ui/seo";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type ProjectWithRole = Project & { role?: string };

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectWithRole | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setIsLoadingTasks] = useState(false);
  const [loadingProject, setIsLoadingProject] = useState(true);
  const [tab, setTab] = useState("plan");

  const { user } = useAuth();

  useEffect(() => {
    async function loadTasks() {
      setIsLoadingTasks(true);
      try {
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .order("order");

        if (error) throw error;
        setTasks(tasks || []);
      } catch (error: any) {
        console.error("Failed to load tasks:", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoadingTasks(false);
      }
    }
    async function loadProject() {
      setIsLoadingProject(true);
      try {
        // First try to load as owner
        const { data: ownedProject, error: ownedError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .eq("user_id", user?.id)
          .single();

        if (!ownedError) {
          setProject(ownedProject);
          loadTasks();
          return;
        }

        // If not owner, check if it's a shared project
        const { data: sharedProject, error: sharedError } = await supabase
          .from("shared_projects")
          .select("project:projects(*), role")
          .eq("project_id", projectId)
          .eq("user_id", user?.id)
          .single();

        if (sharedError) {
          throw new Error("Project not found or no access");
        }

        setProject({
          ...(sharedProject.project as any),
          role: sharedProject.role,
        });
        loadTasks();
      } catch (error) {
        toast.error("Failed to load project");
        console.error("Failed to load project:", error);
      } finally {
        setIsLoadingProject(false);
      }
    }

    if (projectId) {
      loadProject();
    }
    if (project) {
      document.title = project.title;
    }
    const channel = supabase
      .channel("tasks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          loadProject();
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Seo title={project.title} />

      <ProjectHeader project={project} loading={loadingProject} />
      <Tabs defaultValue="plan" value={tab}>
        <TabsList>
          <TabsTrigger value="plan" onClick={() => setTab("plan")}>
            Plan
          </TabsTrigger>
          <TabsTrigger value="chat" onClick={() => setTab("chat")}>
            AI Planner
          </TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="space-y-8">
          <RequirementsList
            projectId={project.id}
            canEdit={!project.role || project.role === "editor"}
          />
          <Separator />
          <TaskList
            projectId={project.id}
            tasks={tasks}
            loading={loadingTasks || loadingProject}
            canEdit={!project.role || project.role === "editor"}
          />
        </TabsContent>
        <TabsContent value="chat">
          <ChatInterface
            projectId={project.id}
            canEdit={!project.role || project.role === "editor"}
            onFinished={() => {
              toast.success("Project plan generated");
              setTab("plan");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
