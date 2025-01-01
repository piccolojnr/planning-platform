import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout";
import HomePage from "@/pages/home";
import ProjectPage from "@/pages/project";
import AuthPage from "@/pages/auth";
import { AuthProvider } from "@/contexts/auth";
import NotFound from "./pages/not-found";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
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
