import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { Header } from "./header";
import { Loader2 } from "lucide-react";

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen animate-spin">
        <Loader2 size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header />
      <main className="flex-1 container py-8 px-4 mx-auto max-w-5xl w-full">
        <Outlet />
      </main>
    </div>
  );
}
