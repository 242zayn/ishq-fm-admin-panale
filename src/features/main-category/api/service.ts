import { apiClient } from "@/lib/api-client";
import type {
  DeleteMainCategoryResponse,
  MainCategoriesApiResponse,
  MainCategoriesResponse,
  MainCategory,
  MainCategoryFilters,
  MainCategoryMutationResponse,
  MainCategoryPayload,
} from "./types";

function normalizeMainCategory(category: unknown): MainCategory {
  if (!category || typeof category !== "object") {
    return {} as MainCategory;
  }
  const raw = category as Record<string, unknown>;
  const id = (raw._id ?? raw.id ?? "") as string;
  const { _id: _, ...details } = raw;
  return { ...details, id } as MainCategory;
}

export const mainCategoryResource = {
  getMainCategories: async (
    params: MainCategoryFilters = {},
  ): Promise<MainCategoriesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.set("page", String(params.page));
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    const response = await apiClient<MainCategoriesApiResponse>(
      `/backend/main-category${query ? `?${query}` : ""}`,
    );
    return {
      ...response,
      data: (response.data || []).map(normalizeMainCategory),
    };
  },
  getMainCategory: async (id: string): Promise<MainCategory> => {
    const response = await apiClient<Record<string, unknown>>(
      `/backend/main-category/${encodeURIComponent(id)}`,
    );
    const doc = response?.mainCategory ?? response?.data ?? response;
    return normalizeMainCategory(doc);
  },
  createMainCategory: async (
    data: MainCategoryPayload,
  ): Promise<MainCategoryMutationResponse> => {
    const response = await apiClient<Record<string, unknown>>(
      "/backend/main-category",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    const mainCategoryDoc =
      response?.mainCategory ?? response?.data ?? response;
    return {
      message:
        (response?.message as string) ?? "Main category created successfully",
      mainCategory: normalizeMainCategory(mainCategoryDoc),
    };
  },
  updateMainCategory: async (
    id: string,
    data: MainCategoryPayload,
  ): Promise<MainCategoryMutationResponse> => {
    const response = await apiClient<Record<string, unknown>>(
      `/backend/main-category/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    const mainCategoryDoc =
      response?.mainCategory ?? response?.data ?? response;
    return {
      message:
        (response?.message as string) ?? "Main category updated successfully",
      mainCategory: normalizeMainCategory(mainCategoryDoc),
    };
  },
  deleteMainCategory: async (
    id: string,
  ): Promise<DeleteMainCategoryResponse> => {
    const response = await apiClient<Record<string, unknown>>(
      `/backend/main-category/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    const deletedDoc =
      response?.deleted ?? response?.mainCategory ?? response?.data ?? response;
    return {
      message:
        (response?.message as string) ?? "Main category deleted successfully",
      deleted: normalizeMainCategory(deletedDoc),
    };
  },
};
