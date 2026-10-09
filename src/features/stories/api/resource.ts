import { apiClient } from '@/lib/api-client';
import type { GetStoriesParams, GetStoriesResponse, Story } from './types';

function buildQuery(params: GetStoriesParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  const search = query.toString();
  return search ? `?${search}` : '';
}

export const storyResource = {
  getStories(params: GetStoriesParams = {}): Promise<GetStoriesResponse> {
    return apiClient<GetStoriesResponse>(`/backend/stories${buildQuery(params)}`);
  },

  getStoriesByCategory(
    categoryId: string,
    params: GetStoriesParams = {}
  ): Promise<GetStoriesResponse> {
    return apiClient<GetStoriesResponse>(
      `/backend/stories/category/${encodeURIComponent(categoryId)}${buildQuery(params)}`
    );
  },

  getStoryById(id: string, lang?: GetStoriesParams['lang']): Promise<Story> {
    const query = lang ? buildQuery({ lang }) : '';
    return apiClient<Story>(`/backend/stories/${encodeURIComponent(id)}${query}`);
  }
};
