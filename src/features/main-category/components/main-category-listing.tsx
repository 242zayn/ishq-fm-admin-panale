import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { mainCategoriesQueryOptions } from '../api/queries';
import { MainCategoryTable } from './main-category-tables';

export default function MainCategoryListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(mainCategoriesQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainCategoryTable />
    </HydrationBoundary>
  );
}
