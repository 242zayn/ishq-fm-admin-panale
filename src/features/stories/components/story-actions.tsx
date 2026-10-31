'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Story } from '../api/types';
import { useDeleteStory, useToggleStoryLike } from '../api/hooks';
import { StoryEditorDialog } from './story-editor-dialog';

const storyIdField = '_id';

export function StoryActions({ story }: { story: Story }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const deleteMutation = useDeleteStory();
  const likeMutation = useToggleStoryLike();
  const isLiked = story.userInteraction?.liked ?? false;

  function deleteStory() {
    deleteMutation.mutate(story[storyIdField], {
      onSuccess: () => {
        toast.success('Story deleted');
        setDeleteOpen(false);
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : 'Could not delete the story.')
    });
  }

  function toggleLike() {
    likeMutation.mutate(story[storyIdField], {
      onSuccess: (result) => {
        toast.success(result.liked ? 'Story liked' : 'Story unliked');
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : 'Could not update the story like.')
    });
  }

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteStory}
        loading={deleteMutation.isPending}
        title='Delete story?'
        description={`“${story.title}” and its likes will be permanently deleted.`}
        confirmLabel='Delete story'
      />
      {editOpen ? (
        <StoryEditorDialog story={story} open={editOpen} onOpenChange={setEditOpen} />
      ) : null}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              type='button'
              variant='ghost'
              size='icon'
              aria-label={`Actions for ${story.title}`}
            />
          }
        >
          <Icons.ellipsis />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <Link
                  href={`/dashboard/stories/${story[storyIdField]}`}
                  aria-label={`View ${story.title}`}
                />
              }
            >
              <Icons.externalLink />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Icons.edit />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleLike} disabled={likeMutation.isPending}>
              <Icons.check />
              {isLiked ? 'Unlike story' : 'Like story'}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant='destructive'
              onClick={() => setDeleteOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Icons.trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
