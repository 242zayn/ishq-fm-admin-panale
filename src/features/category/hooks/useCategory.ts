"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  assignCategoryMutation,
  createCategoryMutation,
  deleteCategoryMutation,
  reorderCategoriesMutation,
  updateCategoryMutation,
} from "../api/mutations";
import {
  allCategoriesQueryOptions,
  categoriesByMainCategoryQueryOptions,
  categoriesQueryOptions,
  categoryQueryOptions,
} from "../api/queries";
import type { CategoryFilters } from "../api/types";

export function useCategories(filters: CategoryFilters) {
  return useQuery({
    ...categoriesQueryOptions(filters),
    enabled: typeof window !== "undefined",
  });
}

export function useCategoriesByMainCategory(
  mainCategoryId: string,
  filters: CategoryFilters = {},
) {
  return useQuery({
    ...categoriesByMainCategoryQueryOptions(mainCategoryId, filters),
    enabled: typeof window !== "undefined" && !!mainCategoryId,
  });
}

export function useAllCategories() {
  return useQuery({
    ...allCategoriesQueryOptions(),
    enabled: typeof window !== "undefined",
  });
}

export function useCategory(id: string) {
  return useQuery({
    ...categoryQueryOptions(id),
    enabled: typeof window !== "undefined",
  });
}

export function useCreateCategory() {
  return useMutation(createCategoryMutation);
}

export function useUpdateCategory() {
  return useMutation(updateCategoryMutation);
}

export function useAssignCategory() {
  return useMutation(assignCategoryMutation);
}

export function useReorderCategories() {
  return useMutation(reorderCategoriesMutation);
}

export function useDeleteCategory() {
  return useMutation(deleteCategoryMutation);
}
