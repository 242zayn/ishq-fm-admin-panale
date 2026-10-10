import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryViewPage from '@/features/category/components/category-view-page';

export const metadata = {
  title: 'Dashboard: Category'
};

type PageProps = Readonly<{ params: Promise<{ id: string }> }>;

export default async function Page(props: PageProps) {
  const { id } = await props.params;

  return (
    <PageContainer>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<Skeleton className='h-96 w-full' />}>
          <CategoryViewPage categoryId={id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
