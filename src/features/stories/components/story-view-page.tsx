"use client";

import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetStoryById } from "../api/hooks";
import { StoryForm } from "./story-form";

export function StoryViewPageSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}

export default function StoryViewPage({ storyId }: { storyId: string }) {
  if (storyId === "new") {
    return <StoryForm initialStory={null} />;
  }

  return <EditStoryView storyId={storyId} />;
}

function EditStoryView({ storyId }: { storyId: string }) {
  const { data: story, error, isPending, refetch } = useGetStoryById(storyId);

  if (isPending) {
    return <StoryViewPageSkeleton />;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-6 max-w-2xl mx-auto my-8"
      >
        <p className="text-sm font-medium text-destructive">
          Could not load story details: {error.message}
        </p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!story || !story._id) {
    notFound();
  }

  return <StoryForm initialStory={story} storyId={storyId} />;
}
