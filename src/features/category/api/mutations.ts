import { mutationOptions } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { categoryResource } from "./service";
import { categoryKeys } from "./queries";
import type { CategoryPayload } from "./types";

export const createCategoryMutation = mutationOptions({
  mutationFn: (data: CategoryPayload) => categoryResource.createCategory(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  },
});

export const updateCategoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: CategoryPayload }) =>
    categoryResource.updateCategory(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  },
});

export const assignCategoryMutation = mutationOptions({
  mutationFn: ({
    categoryId,
    mainCategoryId,
    sortOrder,
  }: {
    categoryId: string;
    mainCategoryId: string | null;
    sortOrder?: number;
  }) =>
    categoryResource.assignCategoryToMainCategory(
      categoryId,
      mainCategoryId,
      sortOrder,
    ),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  },
});

export const reorderCategoriesMutation = mutationOptions({
  mutationFn: (items: { id: string; sortOrder: number }[]) =>
    categoryResource.reorderCategories(items),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  },
});

export const deleteCategoryMutation = mutationOptions({
  mutationFn: (id: string) => categoryResource.deleteCategory(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: categoryKeys.all });
  },
});
