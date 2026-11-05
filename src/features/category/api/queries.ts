import { queryOptions } from "@tanstack/react-query";
import { categoryResource } from "./service";
import type { CategoryFilters } from "./types";

export const categoryKeys = {
  all: ["categories"] as const,
  list: (filters: CategoryFilters) =>
    [...categoryKeys.all, "list", filters] as const,
  byMain: (mainCategoryId: string, filters?: CategoryFilters) =>
    [...categoryKeys.all, "byMain", mainCategoryId, filters] as const,
  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
  allList: () => [...categoryKeys.all, "allList"] as const,
};

export const categoriesQueryOptions = (filters: CategoryFilters) =>
  queryOptions({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoryResource.getCategories(filters),
  });

export const categoriesByMainCategoryQueryOptions = (
  mainCategoryId: string,
  filters: CategoryFilters = {},
) =>
  queryOptions({
    queryKey: categoryKeys.byMain(mainCategoryId, filters),
    queryFn: () =>
      categoryResource.getCategoriesByMainCategory(mainCategoryId, filters),
    enabled: !!mainCategoryId,
  });

export const allCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: categoryKeys.allList(),
    queryFn: () => categoryResource.getAllCategories(),
  });

export const categoryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryResource.getCategory(id),
  });
