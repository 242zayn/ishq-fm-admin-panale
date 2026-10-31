import type { GetStoriesParams } from './types';

export const STORY_QUERY_KEYS = {
  all: ['stories'] as const,
  list: (params: GetStoriesParams) => [...STORY_QUERY_KEYS.all, 'list', params] as const,
  category: (categoryId: string, params: GetStoriesParams) =>
    [...STORY_QUERY_KEYS.all, 'category', categoryId, params] as const,
  detail: (id: string, lang?: string) => [...STORY_QUERY_KEYS.all, 'detail', id, lang] as const
};
