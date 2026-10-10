import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { STORY_QUERY_KEYS } from './keys';
import { storyResource } from './resource';
import type { StoryPayload } from './types';

export const createStoryMutation = mutationOptions({
  mutationFn: (data: StoryPayload) => storyResource.createStory(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: STORY_QUERY_KEYS.all });
  }
});

export const updateStoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: Partial<StoryPayload> }) =>
    storyResource.updateStory(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: STORY_QUERY_KEYS.all });
  }
});

export const deleteStoryMutation = mutationOptions({
  mutationFn: (id: string) => storyResource.deleteStory(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: STORY_QUERY_KEYS.all });
  }
});

export const toggleStoryLikeMutation = mutationOptions({
  mutationFn: (id: string) => storyResource.toggleStoryLike(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: STORY_QUERY_KEYS.all });
  }
});
