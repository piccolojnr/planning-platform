import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Brain, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export function Header() {
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut();
  }

  return (
    <header className="border-b w-full px-4">
      <div className="flex h-16 items-center justify-between w-full">
        <Link to="/" className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-emerald-300" />
          <span className="text-lg font-bold">AI Project Planner</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
