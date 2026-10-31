import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import PageContainer from '@/components/layout/page-container';
import MainCategoryViewPage from '@/features/main-category/components/main-category-view-page';

export const metadata = {
  title: 'Dashboard: Main Category'
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<Skeleton className='h-96 w-full' />}>
          <MainCategoryViewPage categoryId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
