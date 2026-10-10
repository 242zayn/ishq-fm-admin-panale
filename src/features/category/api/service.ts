import { apiClient } from '@/lib/api-client';
import type {
  CategoriesApiResponse,
  CategoriesResponse,
  Category,
  CategoryApiModel,
  CategoryFilters,
  CategoryMutationApiResponse,
  CategoryMutationResponse,
  CategoryPayload,
  DeleteCategoryApiResponse,
  DeleteCategoryResponse
} from './types';

function normalizeCategory(category: CategoryApiModel): Category {
  const { _id, ...details } = category;
  return { ...details, id: _id };
}

export const categoryResource = {
  getCategories: async (params: CategoryFilters = {}): Promise<CategoriesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);
    const query = searchParams.toString();
    const response = await apiClient<CategoriesApiResponse>(
      `/backend/categories${query ? `?${query}` : ''}`
    );
    return { ...response, data: response.data.map(normalizeCategory) };
  },

  getCategory: async (id: string): Promise<Category> =>
    normalizeCategory(
      await apiClient<CategoryApiModel>(`/backend/categories/${encodeURIComponent(id)}`)
    ),

  createCategory: async (data: CategoryPayload): Promise<CategoryMutationResponse> => {
    const response = await apiClient<CategoryMutationApiResponse>('/backend/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { ...response, category: normalizeCategory(response.category) };
  },

  updateCategory: async (id: string, data: CategoryPayload): Promise<CategoryMutationResponse> => {
    const response = await apiClient<CategoryMutationApiResponse>(
      `/backend/categories/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      }
    );
    return { ...response, category: normalizeCategory(response.category) };
  },

  deleteCategory: async (id: string): Promise<DeleteCategoryResponse> => {
    const response = await apiClient<DeleteCategoryApiResponse>(
      `/backend/categories/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
    return { ...response, deleted: normalizeCategory(response.deleted) };
  }
};
