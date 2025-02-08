import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedbackCardProps {
  feedback: any;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const { user } = useAuth();
  const [votes, setVotes] = useState(feedback.votes);
  const [hasVoted, setHasVoted] = useState(
    feedback.feedback_votes?.some((vote: any) => vote.user_id === user?.id)
  );

  async function handleVote() {
    if (!user) return;

    if (hasVoted) {
      const { error } = await supabase
        .from("feedback_votes")
        .delete()
        .eq("feedback_id", feedback.id)
        .eq("user_id", user?.id);

      if (!error) {
        setVotes(votes - 1);
        setHasVoted(false);
      }
    } else {
      const { error } = await supabase
        .from("feedback_votes")
        .insert({ feedback_id: feedback.id, user_id: user?.id });

      if (!error) {
        setVotes(votes + 1);
        setHasVoted(true);
      }
    }
  }

  async function handleDelete() {
    if (!user) return;

    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("id", feedback.id)
      .eq("user_id", user?.id);

    if (!error) {
      // Remove feedback from the list
    }
  }

  const canDelete =
    feedback.user_id === user?.id &&
    ["pending", "rejected"].includes(feedback.status);

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{feedback.title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(feedback.status)}>
            {feedback.status}
          </Badge>
          <Badge variant={getTypeVariant(feedback.type)}>{feedback.type}</Badge>
        </div>
      </div>
      <p className="text-muted-foreground">{feedback.description}</p>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className={hasVoted ? "text-primary" : ""}
            onClick={handleVote}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {votes}
          </Button>
          <span>
            by {feedback.profiles.email} •{" "}
            {formatDistanceToNow(new Date(feedback.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div>
          {canDelete && (
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
function getStatusVariant(status: string) {
  switch (status) {
    case "implemented":
      return "success";
    case "in_review":
      return "warning";
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    default:
      return "secondary";
  }
}

function getTypeVariant(type: string) {
  switch (type) {
    case "bug":
      return "destructive";
    case "feature":
      return "success";
    case "improvement":
      return "warning";
    default:
      return "secondary";
  }
}
