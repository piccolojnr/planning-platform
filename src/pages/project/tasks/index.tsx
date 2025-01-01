import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubtaskList } from "./subtask-list";
import { TaskRequirementsList } from "./task-requirements-list";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function TaskPage() {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();
  const [canEdit, setCanEdit] = useState(false);
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, projectId]);

  // load project
  async function loadProject(): Promise<{
    data: Project | null;
    error: Error | null;
  }> {
    if (!projectId) return { data: null, error: null };

    try {
      const { data: ownedData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("user_id", user?.id)
        .single();

      if (ownedData) {
        setCanEdit(true);
        return { data: ownedData, error };
      }

      const { data: sharedData, error: sharedError } = await supabase
        .from("shared_projects")
        .select("project_id, role, project:projects(*)")
        .eq("user_id", user?.id)
        .eq("project_id", projectId)
        .single();

      setCanEdit(sharedData?.role === "editor");

      return {
        data: {
          ...sharedData?.project,
        } as any,
        error: sharedError,
      };
    } catch (error: any) {
      console.error("Failed to load project", error);
      toast.error("Failed to load project");
      return { data: null, error };
    }
  }

  async function loadTask() {
    if (!taskId || !projectId) return;

    try {
      const [taskResult, projectResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .eq("project_id", projectId)
          .single(),
        // supabase.from("projects").select("*").eq("id", projectId).single(),
        loadProject(),
      ]);

      if (taskResult.error) throw taskResult.error;
      if (projectResult.error) throw projectResult.error;

      setTask(taskResult.data);
      setProject(projectResult.data);
    } catch (error) {
      console.error("Failed to load task", error);
      toast.error("Failed to load task");
      navigate(`/project/${projectId}`);
    } finally {
      setLoading(false);
    }
  }

  // TODO: add requirement generation
  async function generateSubtasks(prompt: string) {
    if (!task || !project) return;
    setGeneratingSubtasks(true);
    try {
      const { data, error: aiError } = await supabase.functions.invoke(
        "generate-subtasks",
        {
          body: {
            taskTitle: task.title,
            taskDescription: task.description,
            projectOverview: project.overview,
            prompt,
          },
        }
      );

      if (aiError) throw aiError;

      const { response } = data;

      // Insert the generated subtasks
      const { error } = await supabase.rpc("override_subtasks", {
        p_subtasks: response.subtasks.map((subtask: any) => ({
          title: subtask.name,
          description: subtask.description,
        })),
        p_task_id: taskId,
      });

      if (error) throw error;

      toast.success("Generated subtasks successfully");
      setAiDialogOpen(false);
    } catch (error) {
      console.error("Failed to generate subtasks", error);
      toast.error("Failed to generate subtasks");
    } finally {
      setGeneratingSubtasks(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  if (!task || !project) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/project/${projectId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{task.status}</Badge>
            {task.description && (
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="subtasks">
        <TabsList>
          <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>
        <TabsContent value="subtasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Subtasks</h2>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate with AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Subtasks with AI</DialogTitle>
                      <DialogDescription>
                        The AI will use the project overview and task details to
                        generate relevant subtasks.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const prompt = (
                          form.elements.namedItem(
                            "prompt"
                          ) as HTMLTextAreaElement
                        ).value;
                        generateSubtasks(prompt);
                      }}
                      className="space-y-4"
                    >
                      <Textarea
                        name="prompt"
                        placeholder="Add any specific requirements or constraints for the subtasks..."
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={generatingSubtasks}>
                          {generatingSubtasks ? (
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          ) : (
                            "Generate Subtasks"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
          <SubtaskList taskId={task.id} canEdit={canEdit} />
        </TabsContent>
        <TabsContent value="requirements" className="space-y-4">
          <TaskRequirementsList taskId={task.id} canEdit={canEdit} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
