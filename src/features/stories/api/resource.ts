import { apiClient } from '@/lib/api-client';
import type {
  GetStoriesParams,
  GetStoriesResponse,
  Story,
  StoryDeleteResponse,
  ImageUploadResponse,
  StoryLikeResponse,
  StoryMutationResponse,
  StoryPayload
} from './types';

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
  uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient<ImageUploadResponse>('/backend/uploads/image', {
      method: 'POST',
      body: formData
    });
  },

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
  },

  createStory(data: StoryPayload): Promise<StoryMutationResponse> {
    return apiClient<StoryMutationResponse>('/backend/stories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateStory(id: string, data: Partial<StoryPayload>): Promise<StoryMutationResponse> {
    return apiClient<StoryMutationResponse>(`/backend/stories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  deleteStory(id: string): Promise<StoryDeleteResponse> {
    return apiClient<StoryDeleteResponse>(`/backend/stories/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  toggleStoryLike(id: string): Promise<StoryLikeResponse> {
    return apiClient<StoryLikeResponse>(`/backend/stories/${encodeURIComponent(id)}/like`, {
      method: 'POST'
    });
  }
};
