import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Brain, LogOut, MessageSquarePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { LinkButton } from "../ui/link-button";

export function Header() {
  const { signOut, user } = useAuth();

  function handleSignOut() {
    signOut();
  }

  return (
    <header className="border-b w-full ">
      <div className="flex h-16 items-center justify-between w-full px-4  max-w-5xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-emerald-300 dark:text-emerald-500" />
          <span className="text-lg font-bold hidden md:block">
            AI Project Planner
          </span>
        </Link>
        <div className="flex items-center gap-4"></div>

        {user ? (
          <div className="flex items-center gap-4">
            <LinkButton variant="ghost" size="sm" to="/dashboard">
              Dashboard
            </LinkButton>
            <LinkButton variant="ghost" size="sm" to="/dashboard/feedback">
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              Feedback
            </LinkButton>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 text-red-300 dark:text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <LinkButton variant="ghost" size="sm" to="/signin">
              Sign In
            </LinkButton>
            <LinkButton variant="ghost" size="sm" to="/signup">
              Sign Up
            </LinkButton>
          </div>
        )}
      </div>
    </header>
  );
}
