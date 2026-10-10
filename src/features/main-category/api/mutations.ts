import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { mainCategoryResource } from './service';
import { mainCategoryKeys } from './queries';
import type { MainCategoryPayload } from './types';

export const createMainCategoryMutation = mutationOptions({
  mutationFn: (data: MainCategoryPayload) => mainCategoryResource.createMainCategory(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: mainCategoryKeys.all });
  }
});

export const updateMainCategoryMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: MainCategoryPayload }) =>
    mainCategoryResource.updateMainCategory(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: mainCategoryKeys.all });
  }
});

export const deleteMainCategoryMutation = mutationOptions({
  mutationFn: (id: string) => mainCategoryResource.deleteMainCategory(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: mainCategoryKeys.all });
  }
});
