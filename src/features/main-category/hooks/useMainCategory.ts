'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createMainCategoryMutation,
  deleteMainCategoryMutation,
  updateMainCategoryMutation
} from '../api/mutations';
import {
  allMainCategoriesQueryOptions,
  mainCategoriesQueryOptions,
  mainCategoryQueryOptions
} from '../api/queries';
import { MainCategoryFilters } from '../api/types';

export function useAllMainCategories() {
  return useQuery({
    ...allMainCategoriesQueryOptions(),
    enabled: typeof window !== 'undefined'
  });
}

export function useMainCategories(filters: MainCategoryFilters) {
  return useQuery({
    ...mainCategoriesQueryOptions(filters),
    enabled: typeof window !== 'undefined'
  });
}

export function useMainCategory(id: string) {
  return useQuery({
    ...mainCategoryQueryOptions(id),
    enabled: typeof window !== 'undefined'
  });
}

export function useCreateMainCategory() {
  return useMutation(createMainCategoryMutation);
}

export function useUpdateMainCategory() {
  return useMutation(updateMainCategoryMutation);
}

export function useDeleteMainCategory() {
  return useMutation(deleteMainCategoryMutation);
}
