import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { mainCategoryQueryOptions } from '@/features/main-category/api/queries';
import PageContainer from '@/components/layout/page-container';
import MainCategoryViewPage from '@/features/main-category/components/main-category-view-page';

export const metadata = {
  title: 'Dashboard: Main Category'
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function Page(props: PageProps) {
  const params = await props.params;
  const queryClient = getQueryClient();

  if (params.id !== 'new') {
    void queryClient.prefetchQuery(mainCategoryQueryOptions(params.id));
  }

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <MainCategoryViewPage categoryId={params.id} />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
