import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "../../components/project/project-header";
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
import { CompletionCheckDialog } from "@/components/project/completion-check-dialog";

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
  const [checkDialogOpen, setCheckDialogOpen] = useState(false);
  const [incompleteTasks, setIncompleteTasks] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    async function loadTasks() {
      if (!projectId) return;
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
      if (!projectId || !user) return;
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

  async function checkCompletion() {
    if (!projectId) return;

    try {
      // Get all tasks and their subtasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select(
          `
          id,
          title,
          status,
          subtasks (
            id,
            title,
            status
          )
        `
        )
        .eq("project_id", projectId);

      if (tasksError) throw tasksError;

      // Filter incomplete tasks and subtasks
      const incomplete = tasksData
        .filter((task) => {
          const hasIncompleteSubtasks = task.subtasks.some(
            (subtask: any) => subtask.status === "pending"
          );
          return task.status === "pending" || hasIncompleteSubtasks;
        })
        .map((task) => ({
          taskId: task.id,
          taskTitle: task.title,
          subtasks: task.subtasks
            .filter((subtask: any) => subtask.status === "pending")
            .map((subtask: any) => ({
              id: subtask.id,
              title: subtask.title,
            })),
        }));

      setIncompleteTasks(incomplete);
      setCheckDialogOpen(true);
    } catch (error) {
      console.error("Failed to check completion:", error);
      toast.error("Failed to check completion");
    }
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Seo title={project.title} />

      <div className="flex items-center justify-between">
        <ProjectHeader
          project={project}
          loading={loadingProject}
          checkCompletion={checkCompletion}
        />
      </div>

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

      <CompletionCheckDialog
        open={checkDialogOpen}
        onOpenChange={setCheckDialogOpen}
        projectId={projectId!}
        incompleteTasks={incompleteTasks}
        onComplete={async () => {
          toast.success("All items marked as complete");
          setCheckDialogOpen(false);
        }}
      />
    </div>
  );
}
