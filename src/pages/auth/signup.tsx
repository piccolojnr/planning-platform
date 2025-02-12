import { Navigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { AuthForm } from "./auth-form";
import { Seo } from "@/components/ui/seo";

export default function SignupPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className=" flex items-center justify-center">
      <Seo title="Sign in" />

      <div className="w-full max-w-sm space-y-8 p-8">
        <div className="flex flex-col items-center space-y-2">
          <Brain className="h-12 w-12" />
          <h1 className="text-2xl font-bold">AI Project Planner</h1>
          <p className="text-muted-foreground">
            Sign in to start planning your projects
          </p>
        </div>
        <AuthForm isSignUp />
      </div>
    </div>
  );
}
