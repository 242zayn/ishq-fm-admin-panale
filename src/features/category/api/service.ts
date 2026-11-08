import { apiClient } from "@/lib/api-client";
import type {
  CategoriesApiResponse,
  CategoriesResponse,
  Category,
  CategoryFilters,
  CategoryMutationResponse,
  CategoryPayload,
  DeleteCategoryResponse,
} from "./types";

function normalizeCategory(category: unknown): Category {
  if (!category || typeof category !== "object") {
    return {} as Category;
  }
  let raw = category as Record<string, unknown>;
  if (raw.category && typeof raw.category === "object") {
    raw = raw.category as Record<string, unknown>;
  } else if (
    raw.data &&
    typeof raw.data === "object" &&
    !Array.isArray(raw.data)
  ) {
    raw = raw.data as Record<string, unknown>;
  }
  const id = (raw._id ?? raw.id ?? "") as string;
  const { _id: _, ...details } = raw;
  return { ...details, id } as Category;
}

export const categoryResource = {
  getCategories: async (params: CategoryFilters = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.set("page", String(params.page));
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    if (params.mainCategory)
      searchParams.set("mainCategory", params.mainCategory);
    if (params.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive));
    if (params.isFeatured !== undefined)
      searchParams.set("isFeatured", String(params.isFeatured));
    const query = searchParams.toString();
    const response = await apiClient<CategoriesApiResponse>(
      `/backend/categories${query ? `?${query}` : ""}`,
    );
    console.log("response is that", response);
    // return { ...response, data: (response.data || []).map(normalizeCategory) };
    return response;
  },

  getCategoriesByMainCategory: async (
    mainCategoryId: string,
    params: CategoryFilters = {},
  ) => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.set("page", String(params.page));
    if (params.limit !== undefined)
      searchParams.set("limit", String(params.limit));
    if (params.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    const response = await apiClient<CategoriesApiResponse>(
      `/backend/categories/main/${encodeURIComponent(mainCategoryId)}${query ? `?${query}` : ""}`,
    );
    return response;
    // return { ...response, data: (response.data || []).map(normalizeCategory) };
  },

  getAllCategories: async (): Promise<Category[]> => {
    const response = await categoryResource.getCategories({
      page: 1,
      limit: 200,
    });
    return response.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await apiClient<Record<string, unknown>>(
      `/backend/categories/${encodeURIComponent(id)}`,
    );
    const doc = response?.category ?? response?.data ?? response;
    return normalizeCategory(doc);
  },

  createCategory: async (
    data: CategoryPayload,
  ): Promise<CategoryMutationResponse> => {
    const response = await apiClient<Record<string, unknown>>(
      "/backend/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    const categoryDoc = response?.category ?? response?.data ?? response;
    return {
      message: (response?.message as string) ?? "Category created successfully",
      category: normalizeCategory(categoryDoc),
    };
  },

  updateCategory: async (
    id: string,
    data: CategoryPayload,
  ): Promise<CategoryMutationResponse> => {
    const response = await apiClient<Record<string, unknown>>(
      `/backend/categories/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    const categoryDoc = response?.category ?? response?.data ?? response;
    return {
      message: (response?.message as string) ?? "Category updated successfully",
      category: normalizeCategory(categoryDoc),
    };
  },

  uploadBanner: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient<{
      success: boolean;
      message: string;
      data: { url: string; publicId?: string };
    }>("/backend/uploads/image", {
      method: "POST",
      body: formData,
    });
    return response.data?.url ?? "";
  },

  assignCategoryToMainCategory: async (
    categoryId: string,
    mainCategoryId: string | null,
    sortOrder?: number,
  ): Promise<CategoryMutationResponse> => {
    return categoryResource.updateCategory(categoryId, {
      mainCategory: mainCategoryId,
      ...(sortOrder !== undefined ? { sortOrder } : {}),
    });
  },

  reorderCategories: async (
    items: { id: string; sortOrder: number }[],
  ): Promise<CategoryMutationResponse[]> => {
    return Promise.all(
      items.map((item) =>
        categoryResource.updateCategory(item.id, { sortOrder: item.sortOrder }),
      ),
    );
  },

  deleteCategory: async (id: string): Promise<DeleteCategoryResponse> => {
    const response = await apiClient<Record<string, unknown>>(
      `/backend/categories/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    const deletedDoc =
      response?.deleted ?? response?.category ?? response?.data ?? response;
    return {
      message: (response?.message as string) ?? "Category deleted successfully",
      deleted: normalizeCategory(deletedDoc),
    };
  },
};
