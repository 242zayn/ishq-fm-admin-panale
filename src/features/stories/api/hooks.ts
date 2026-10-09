'use client';

import { useQuery } from '@tanstack/react-query';
import { storyResource } from './resource';
import type { GetStoriesParams } from './types';

type QueryOptions = {
  enabled?: boolean;
};

export const STORY_QUERY_KEYS = {
  all: ['stories'] as const,
  list: (params: GetStoriesParams) => [...STORY_QUERY_KEYS.all, 'list', params] as const,
  category: (categoryId: string, params: GetStoriesParams) =>
    [...STORY_QUERY_KEYS.all, 'category', categoryId, params] as const,
  detail: (id: string, lang?: string) => [...STORY_QUERY_KEYS.all, 'detail', id, lang] as const
};

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
