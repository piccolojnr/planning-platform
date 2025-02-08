import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { FeedbackCard } from "./feedback-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeedbackListProps {
  sortBy: "created_at" | "votes";
  search: string;
  type: string;
  status: string;
  onlyMine?: boolean;
}

const ITEMS_PER_PAGE = 10;

export function FeedbackList({
  sortBy,
  search,
  type,
  status,
  onlyMine,
}: FeedbackListProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadFeedback = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // First, get the total count
    let countQuery = supabase
      .from("feedback")
      .select("*", { count: "exact", head: true });

    if (search) {
      countQuery = countQuery.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }
    if (type !== "all") {
      countQuery = countQuery.eq("type", type);
    }
    if (status !== "all") {
      countQuery = countQuery.eq("status", status);
    }
    if (onlyMine) {
      countQuery = countQuery.eq("user_id", user?.id);
    }

    const { count } = await countQuery;
    setTotalCount(count || 0);

    // Then get the paginated data
    let query = supabase
      .from("feedback")
      .select(
        `
          *,
          feedback_votes(user_id),
          profiles:users(email)
        `
      )
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (type !== "all") {
      query = query.eq("type", type);
    }
    if (status !== "all") {
      query = query.eq("status", status);
    }
    if (onlyMine) {
      query = query.eq("user_id", user?.id);
    }

    query = query.order(sortBy, { ascending: false });

    const { data, error } = await query;

    if (!error && data) {
      setFeedback(data);
    }
    setLoading(false);
  }, [user, sortBy, search, type, status, onlyMine, page]);

  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [search, type, status, onlyMine]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  useEffect(() => {
    const channel = supabase
      .channel("feedback")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedback",
        },
        () => {
          loadFeedback();
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [loadFeedback]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {feedback.map((item) => (
          <FeedbackCard key={item.id} feedback={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
