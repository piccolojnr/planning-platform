import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Layout, { ProtectedRoute } from "@/components/layout";
import HomePage from "@/pages/home";
import ProjectPage from "@/pages/project";
import FeedbackPage from "@/pages/feedback";
import { AuthProvider } from "@/contexts/auth";
import NotFound from "./pages/not-found";
import TaskPage from "./pages/project/tasks";
import DashboardPage from "./pages/home/dashboard";
import SigninPage from "./pages/auth/signin";
import SignupPage from "./pages/auth/signup";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/signin" element={<SigninPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/" element={<HomePage />} />
              {/*  */}
              <Route path="/dashboard" element={<ProtectedRoute />}>
                <Route index element={<DashboardPage />} />
                <Route path="project/:projectId" element={<ProjectPage />} />
                <Route
                  path="project/:projectId/tasks/:taskId"
                  element={<TaskPage />}
                />
                <Route path="feedback" element={<FeedbackPage />} />
              </Route>
              {/*  */}
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
