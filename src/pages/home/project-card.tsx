import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { Database } from "@/types/supabase";

type Project = Database["public"]["Tables"]["projects"]["Row"];

interface ProjectCardProps {
  project: Project;
  role?: string;
}

export function ProjectCard({ project, role }: ProjectCardProps) {
  return (
    <Link to={`/project/${project.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{project.title}</CardTitle>
            <div className="flex items-center gap-2">
              {role && (
                <Badge variant="outline" className="capitalize">
                  {role}
                </Badge>
              )}
              <Badge variant="secondary">{project.model}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Created{" "}
            {formatDistanceToNow(new Date(project.created_at || Date.now()))}{" "}
            ago
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
