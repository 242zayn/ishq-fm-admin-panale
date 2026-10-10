'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createStoryMutation,
  deleteStoryMutation,
  toggleStoryLikeMutation,
  updateStoryMutation
} from './mutations';
import { STORY_QUERY_KEYS } from './keys';
import { storyResource } from './resource';
import type { GetStoriesParams } from './types';

type QueryOptions = {
  enabled?: boolean;
};

export { STORY_QUERY_KEYS } from './keys';

export function useGetStories(params: GetStoriesParams = {}, options?: QueryOptions) {
  return useQuery({
    queryKey: STORY_QUERY_KEYS.list(params),
    queryFn: () => storyResource.getStories(params),
    enabled: options?.enabled ?? true
  });
}

export function useGetStoriesByCategory(
  categoryId: string,
  params: GetStoriesParams = {},
  options?: QueryOptions
) {
  return useQuery({
    queryKey: STORY_QUERY_KEYS.category(categoryId, params),
    queryFn: () => storyResource.getStoriesByCategory(categoryId, params),
    enabled: options?.enabled ?? Boolean(categoryId)
  });
}

export function useGetStoryById(
  id: string,
  lang?: GetStoriesParams['lang'],
  options?: QueryOptions
) {
  return useQuery({
    queryKey: STORY_QUERY_KEYS.detail(id, lang),
    queryFn: () => storyResource.getStoryById(id, lang),
    enabled: options?.enabled ?? Boolean(id)
  });
}

export function useCreateStory() {
  return useMutation(createStoryMutation);
}

export function useUpdateStory() {
  return useMutation(updateStoryMutation);
}

export function useDeleteStory() {
  return useMutation(deleteStoryMutation);
}

export function useToggleStoryLike() {
  return useMutation(toggleStoryLikeMutation);
}
