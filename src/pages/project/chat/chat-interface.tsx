import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Send, AlertCircle, Trash } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { generateAIResponse, ProjectPlan, generateProjectPlan } from "@/lib/ai";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";

type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];

interface ChatInterfaceProps {
  projectId: string;
  canEdit: boolean;
  onFinished: () => void;
}

export function ChatInterface({
  projectId,
  canEdit,
  onFinished,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);

  useEffect(() => {
    if (projectPlan) {
      setPhase(2);
    } else {
      setPhase(0);
    }
  }, [projectPlan]);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useLayoutEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadMessages() {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      console.error(error);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(input: string) {
    if (!input.trim() || !canEdit) return;

    setSending(true);
    setError(null);

    try {
      setInput("");

      if (scrollAreaRef.current)
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;

      const conversation = messages.map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }));

      conversation.push({ role: "user", content: input.trim() });

      const { data, error: aiError } = await generateAIResponse(conversation);

      if (aiError) throw aiError;

      const { data: userData, error: userError } = await supabase
        .from("chat_messages")
        .insert({
          project_id: projectId,
          role: "user",
          content: input.trim(),
        })
        .select("*")
        .single();

      if (userError) throw userError;
      setMessages((prev) => [...prev, userData]);

      const { data: aiData, error: insertError } = await supabase
        .from("chat_messages")
        .insert({
          project_id: projectId,
          role: "assistant",
          content: data.response,
        })
        .select("*")
        .single();

      if (insertError) throw insertError;
      setMessages((prev) => [...prev, aiData]);
    } catch (error: any) {
      console.error(error);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("id", id)
        .eq("project_id", projectId);
      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (error: any) {
      console.error(error);
      setError("Failed to delete message. Please try again.");
    }
  };

  // handleGeneratePlan
  const handleGeneratePlan = async () => {
    setPhase(1);
    try {
      const conversation = messages.map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }));
      const { data, error } = await generateProjectPlan(conversation);
      if (error) {
        console.error(error);
        setError("Failed to generate project plan. Please try again.");
      } else {
        setProjectPlan(data);
        setPhase(2);
      }
    } catch (error: any) {
      console.error(error);
      setError("Failed to generate project plan. Please try again.");
      setPhase(0);
    }
  };

  const handleOverrideProject = async () => {
    if (!projectPlan) return;
    setPhase(3);
    try {
      const { error } = await supabase.rpc("override_project_data", {
        p_project_id: projectId,
        p_name: projectPlan.project_name,
        p_description: projectPlan.project_description,
        p_tasks: projectPlan.tasks.map((task) => ({ ...task })), // pass as an array of objects
        p_requirements: projectPlan.requirements.map((req) => ({
          content: req,
        })),
        p_overview: projectPlan.overview,
      });

      if (error) {
        console.error("Failed to override project data:", error);
      } else {
        setPhase(0);
        setProjectPlan(null);
        onFinished();
      }
    } catch (error: any) {
      console.error(error);
      setError("Failed to override project data. Please try again.");
      setPhase(2);
    }
  };

  const handleDiscardPlan = async () => {
    console.log("Success!");

    // Clear out the plan
    setProjectPlan(null);
    // Possibly reset phase or do other logic
    setPhase(0);
  };

  const handleResetConversation = async () => {
    setSending(true);
    try {
      const { error } = await supabase.rpc("reset_conversation", {
        p_project_id: projectId,
      });

      if (error) {
        console.error("Failed to reset chat:", error);
        setError("Failed to reset chat. Please try again.");
      } else {
        setMessages([]);
        setProjectPlan(null);
        setPhase(0);
      }
    } catch (error: any) {
      console.error(error);
      setError("Failed to reset chat. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleAddMoreFeatures = async () => {
    // delete last chat from assistant and write a chat asking to add more features
    setSending(true);
    try {
      await supabase.rpc("delete_last_chat", {
        p_project_id: projectId,
      });

      await sendMessage("I would like to add more features to the project.");
    } catch (error: any) {
      console.error(error);
      setError("Failed to add more features. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const isDone =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].content.includes("<GENERATE>");

  return (
    <div className="flex flex-col border rounded-lg h-[90vh]">
      {phase === 1 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-lg font-semibold text-primary">
            Generating project plan...
          </p>
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg max-w-md text-center">
            <p className="font-medium">
              Please do not reload or navigate away from this page.
            </p>
            <p className="text-sm">
              Interrupting the process may cause data loss or corruption.
            </p>
          </div>
        </div>
      ) : phase === 2 && projectPlan ? (
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center space-y-8">
          <h2 className="text-2xl font-semibold">Generated Project Plan</h2>
          <p className="text-sm text-muted-foreground max-w-prose">
            Below is the proposed project plan based on the conversation with
            the AI. You can override your current project with these details or
            simply discard the plan.
          </p>

          <div className=" rounded-lg shadow p-4 border max-w-3xl w-full space-y-4">
            <div>
              <h3 className="text-lg font-medium">Project Name</h3>
              <p className="text-base">{projectPlan.project_name}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-base">{projectPlan.project_description}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Development Model</h3>
              <p className="text-base">{projectPlan.development_model}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Tasks</h3>
              <ul className="list-disc list-inside space-y-2">
                {projectPlan.tasks.map((task, i) => (
                  <li key={i} className="ml-2">
                    <span className="font-semibold">{task.name}</span> —{" "}
                    {task.description}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Duration: {task.duration} days
                    </span>
                    {task.dependencies.length > 0 && (
                      <span className="text-sm text-muted-foreground block">
                        Depends on: {task.dependencies.join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1">
                {projectPlan.requirements.map((req, i) => (
                  <li key={i} className="ml-2">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 max-w-3xl w-full">
            <Button variant="outline" onClick={handleDiscardPlan}>
              Discard Plan
            </Button>
            <Button onClick={handleOverrideProject}>Override Project</Button>
          </div>
        </div>
      ) : phase === 3 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <Loader2 size={48} className="animate-spin text-primary" />
          <p className="text-lg font-semibold text-primary">
            Overriding project plan...
          </p>
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg max-w-md text-center">
            <p className="font-medium">
              Please do not reload or navigate away from this page.
            </p>
            <p className="text-sm">
              Interrupting the process may cause data loss or corruption.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">AI Project Planner</h2>
            <p className="text-sm text-muted-foreground">
              Chat with AI to create your project plan
            </p>
          </div>

          <div
            ref={scrollAreaRef}
            // className="flex-1 p-4 space-y-4"
            className="flex-1 p-4 space-y-4 overflow-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 size={32} className="animate-spin" />
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 mt-4",
                    message.role === "assistant"
                      ? "flex-row"
                      : "flex-row-reverse"
                  )}
                >
                  <Avatar
                    className={cn(
                      "w-8 h-8",
                      message.role === "assistant" ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <AvatarFallback>
                      {message.role === "assistant" ? "AI" : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                      message.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <ReactMarkdown>
                      {message.content.replace("<GENERATE>", "")}
                    </ReactMarkdown>
                    {/* button to generate plan */}
                    {message.content.includes("<GENERATE>") && (
                      <Button
                        className="mt-2 text-sm"
                        size="sm"
                        onClick={() => {
                          handleGeneratePlan();
                        }}
                      >
                        Generate Project Plan
                      </Button>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      onClick={() => handleDelete(message.id)}
                      className="flex-shrink-0"
                      variant="ghost"
                      size="icon"
                    >
                      <Trash size={16} />
                    </Button>
                  )}
                </div>
              ))
            )}
            {sending && (
              <div className="flex items-start gap-3 flex-row mt-4 animate-pulse">
                <Avatar className="w-8 h-8 bg-primary">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-3 py-2 max-w-[80%] text-sm bg-muted">
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-100 border border-red-200 rounded-md text-red-600 mt-4 w-[80%] mx-auto">
                <AlertCircle size={24} />
                <span>{error}</span>
              </div>
            )}

            <div className="h-16" />
          </div>
          {isDone ? (
            <div className="flex justify-center gap-2 p-4 border-t">
              {/* generate plan, reset conversation, add more features */}
              <Button
                onClick={handleResetConversation}
                className="flex-shrink-0 mr-2 text-red-600"
                disabled={sending}
              >
                Reset Conversation
              </Button>
              <Button
                onClick={handleAddMoreFeatures}
                className="flex-shrink-0 mr-2"
                disabled={sending}
              >
                Add More Features
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="p-4 border-t"
            >
              <div className="flex gap-2 items-center">
                <Textarea
                  placeholder={
                    canEdit
                      ? "Type your message..."
                      : "You don't have permission to send messages"
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!canEdit || sending}
                />
                <Button type="submit" disabled={!canEdit || sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
