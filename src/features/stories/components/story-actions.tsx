"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AlertModal } from "@/components/modal/alert-modal";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Story } from "../api/types";
import { useDeleteStory, useToggleStoryLike } from "../api/hooks";
import { StoryEditorDialog } from "./story-editor-dialog";
import { useRouter } from "next/navigation";

const storyIdField = "_id";

export function StoryActions({ story }: { story: Story }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const deleteMutation = useDeleteStory();
  const likeMutation = useToggleStoryLike();
  const isLiked = story.userInteraction?.liked ?? false;

  const router = useRouter();

  function deleteStory() {
    deleteMutation.mutate(story[storyIdField], {
      onSuccess: () => {
        toast.success("Story deleted");
        setDeleteOpen(false);
      },
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not delete the story.",
        ),
    });
  }

  function toggleLike() {
    likeMutation.mutate(story[storyIdField], {
      onSuccess: (result) => {
        toast.success(result.liked ? "Story liked" : "Story unliked");
      },
      onError: (error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not update the story like.",
        ),
    });
  }

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteStory}
        loading={deleteMutation.isPending}
        title="Delete story?"
        description={`“${story.title}” and its likes will be permanently deleted.`}
        confirmLabel="Delete story"
      />
      {editOpen ? (
        <StoryEditorDialog
          story={story}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() =>
            router.push(`/dashboard/stories/${story[storyIdField]}`)
          }
          title="Edit Category"
        >
          <Icons.video />
          <span className="sr-only"> View</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg border border-border/40 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => setEditOpen(true)}
          title="Edit Category"
        >
          <Icons.edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={() => setDeleteOpen(true)}
          title="Delete Category"
        >
          <Icons.trash className="h-4 w-4" />
          <span className="sr-only"> Delete</span>
        </Button>
      </div>
    </>
  );
}
