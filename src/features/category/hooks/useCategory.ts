'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createCategoryMutation,
  deleteCategoryMutation,
  updateCategoryMutation
} from '../api/mutations';
import { categoriesQueryOptions, categoryQueryOptions } from '../api/queries';
import type { CategoryFilters } from '../api/types';

export function useCategories(filters: CategoryFilters) {
  return useQuery({
    ...categoriesQueryOptions(filters),
    enabled: typeof window !== 'undefined'
  });
}

export function useCategory(id: string) {
  return useQuery({
    ...categoryQueryOptions(id),
    enabled: typeof window !== 'undefined'
  });
}

export function useCreateCategory() {
  return useMutation(createCategoryMutation);
}

export function useUpdateCategory() {
  return useMutation(updateCategoryMutation);
}

export function useDeleteCategory() {
  return useMutation(deleteCategoryMutation);
}
