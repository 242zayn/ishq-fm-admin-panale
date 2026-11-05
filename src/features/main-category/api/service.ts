import { apiClient } from "@/lib/api-client";
import type {
  DeleteMainCategoryResponse,
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
  let raw = category as Record<string, unknown>;
  if (raw.mainCategory && typeof raw.mainCategory === "object") {
    raw = raw.mainCategory as Record<string, unknown>;
  } else if (
    raw.data &&
    typeof raw.data === "object" &&
    !Array.isArray(raw.data)
  ) {
    raw = raw.data as Record<string, unknown>;
  }
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
    const rawResponse = await apiClient<
      Record<string, unknown> & {
        message?: string;
        data?: unknown[];
        paginate?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
        pagination?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
        meta?: {
          pagination?: {
            total?: number;
            page?: number;
            limit?: number;
            totalPages?: number;
            hasNextPage?: boolean;
            hasPreviousPage?: boolean;
          };
        };
      }
    >(`/backend/main-category${query ? `?${query}` : ""}`);

    const rawList = Array.isArray(rawResponse?.data) ? rawResponse.data : [];
    const rawPaginate =
      rawResponse?.paginate ??
      rawResponse?.pagination ??
      rawResponse?.meta?.pagination;

    const total = rawPaginate?.total ?? rawList.length;
    const page = rawPaginate?.page ?? params.page ?? 1;
    const limit = rawPaginate?.limit ?? params.limit ?? (total || 10);
    const totalPages =
      rawPaginate?.totalPages ?? Math.max(1, Math.ceil(total / (limit || 1)));

    return {
      message:
        (rawResponse?.message as string) ??
        "Main categories fetched successfully",
      data: rawList.map(normalizeMainCategory),
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
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
