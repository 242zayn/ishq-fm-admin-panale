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

export const allMainCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: [...mainCategoryKeys.all, 'options'] as const,
    queryFn: async () => {
      const pageSize = 100;
      const firstPage = await mainCategoryResource.getMainCategories({
        page: 1,
        limit: pageSize
      });
      const { totalPages } = firstPage.meta.pagination;

      if (totalPages <= 1) {
        return firstPage.data;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          mainCategoryResource.getMainCategories({ page: index + 2, limit: pageSize })
        )
      );

      return [firstPage, ...remainingPages].flatMap((page) => page.data);
    }
  });

export const mainCategoryQueryOptions = (id: string) =>
  queryOptions({
    queryKey: mainCategoryKeys.detail(id),
    queryFn: () => mainCategoryResource.getMainCategory(id)
  });
