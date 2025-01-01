import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

type SharedProject = Database["public"]["Tables"]["shared_projects"]["Row"] & {
  user: { email: string };
};

interface ShareListProps {
  projectId: string;
}

export function ShareList({ projectId }: ShareListProps) {
  const [shares, setShares] = useState<SharedProject[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    loadShares();

    const channel = supabase
      .channel("shared_projects")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shared_projects",
        },
        () => {
          loadShares();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [projectId]);

  async function loadShares() {
    const { data, error } = await supabase
      .from("shared_projects")
      .select("*, user:users(email)")
      .eq("project_id", projectId);

    if (error) {
      toast.error("Failed to load shares");
      return;
    }

    setShares(data || []);
  }

  async function removeShare(id: string) {
    try {
      const { error } = await supabase
        .from("shared_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setShares((prev) => prev.filter((share) => share.id !== id));
      toast.success("Share removed");
    } catch (error) {
      toast.error("Failed to remove share");
    }
  }

  if (shares.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No shares yet
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shares.map((share) => (
          <TableRow key={share.id}>
            <TableCell>{share.user.email}</TableCell>
            <TableCell className="capitalize">{share.role}</TableCell>
            <TableCell>
              {
                // Only allow owner to remove shares
                user?.id !== share.user_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeShare(share.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
