import { queryOptions } from '@tanstack/react-query';
import { mainCategoryResource } from './service';
import type { MainCategoryFilters } from './types';

export const mainCategoryKeys = {
  all: ['main-categories'] as const,
  list: (filters: MainCategoryFilters) => [...mainCategoryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...mainCategoryKeys.all, 'detail', id] as const
};

export const mainCategoriesQueryOptions = (filters: MainCategoryFilters) =>
  queryOptions({
    queryKey: mainCategoryKeys.list(filters),
    queryFn: () => mainCategoryResource.getMainCategories(filters)
  });

export const mainCategoryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: mainCategoryKeys.detail(id),
    queryFn: () => mainCategoryResource.getMainCategory(id)
  });
