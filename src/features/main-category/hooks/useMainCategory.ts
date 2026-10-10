'use client';

import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createMainCategoryMutation, deleteMainCategoryMutation, updateMainCategoryMutation } from '../api/mutations';
import { mainCategoriesQueryOptions, mainCategoryQueryOptions } from '../api/queries';
import { MainCategoryFilters } from '../api/types';

export function useMainCategories(filters: MainCategoryFilters) {
  return useSuspenseQuery(mainCategoriesQueryOptions(filters));
}

export function useMainCategory(id: string) {
  return useSuspenseQuery(mainCategoryQueryOptions(id));
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
