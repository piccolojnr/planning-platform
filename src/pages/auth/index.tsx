import { Navigate } from "react-router-dom";
import { Brain, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { AuthForm } from "./auth-form";

export default function AuthPage() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} />
      </div>
    );
  }
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="flex flex-col items-center space-y-2">
          <Brain className="h-12 w-12" />
          <h1 className="text-2xl font-bold">AI Project Planner</h1>
          <p className="text-muted-foreground">
            Sign in to start planning your projects
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
