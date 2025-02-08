import { useState } from "react";
// import { useAuth } from "@/contexts/auth";
// import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackList } from "@/components/feedback/feedback-list";
import { CreateFeedbackDialog } from "@/components/feedback/create-feedback-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FeedbackPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feedback & Suggestions</h1>
        <Button onClick={() => setIsCreateOpen(true)}>Submit Feedback</Button>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search feedback..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="latest" className="w-full">
        <TabsList>
          <TabsTrigger value="latest">Latest</TabsTrigger>
          <TabsTrigger value="top">Top Voted</TabsTrigger>
          <TabsTrigger value="my">My Feedback</TabsTrigger>
        </TabsList>
        <TabsContent value="latest">
          <FeedbackList
            sortBy="created_at"
            search={search}
            type={type}
            status={status}
          />
        </TabsContent>
        <TabsContent value="top">
          <FeedbackList
            sortBy="votes"
            search={search}
            type={type}
            status={status}
          />
        </TabsContent>
        <TabsContent value="my">
          <FeedbackList
            onlyMine
            sortBy="created_at"
            search={search}
            type={type}
            status={status}
          />
        </TabsContent>
      </Tabs>

      <CreateFeedbackDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
} 