import { apiClient } from '@/lib/api-client';
import type {
  DeleteMainCategoryApiResponse,
  MainCategoriesResponse,
  MainCategoriesApiResponse,
  MainCategory,
  MainCategoryApiModel,
  MainCategoryFilters,
  MainCategoryMutationApiResponse,
  MainCategoryMutationResponse,
  MainCategoryPayload,
  DeleteMainCategoryResponse
} from './types';

const categoryIdField = '_id';

function normalizeMainCategory(category: MainCategoryApiModel): MainCategory {
  const { [categoryIdField]: id, ...details } = category;
  return { ...details, id };
}

export const mainCategoryResource = {
  getMainCategories: async (params: MainCategoryFilters = {}): Promise<MainCategoriesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    const response = await apiClient<MainCategoriesApiResponse>(
      `/backend/main-category${query ? `?${query}` : ''}`
    );
    return { ...response, data: response.data.map(normalizeMainCategory) };
  },
  getMainCategory: async (id: string): Promise<MainCategory> =>
    normalizeMainCategory(
      await apiClient<MainCategoryApiModel>(`/backend/main-category/${encodeURIComponent(id)}`)
    ),
  createMainCategory: async (data: MainCategoryPayload): Promise<MainCategoryMutationResponse> => {
    const response = await apiClient<MainCategoryMutationApiResponse>('/backend/main-category', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { ...response, mainCategory: normalizeMainCategory(response.mainCategory) };
  },
  updateMainCategory: async (
    id: string,
    data: MainCategoryPayload
  ): Promise<MainCategoryMutationResponse> => {
    const response = await apiClient<MainCategoryMutationApiResponse>(
      `/backend/main-category/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    );
    return { ...response, mainCategory: normalizeMainCategory(response.mainCategory) };
  },
  deleteMainCategory: async (id: string): Promise<DeleteMainCategoryResponse> => {
    const response = await apiClient<DeleteMainCategoryApiResponse>(
      `/backend/main-category/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    return { ...response, deleted: normalizeMainCategory(response.deleted) };
  }
};
