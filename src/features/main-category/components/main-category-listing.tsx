import { Suspense } from 'react';
import { MainCategoryTable } from './main-category-tables';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainCategoryListingPage() {
  return (
    <Suspense
      fallback={
        <div className='space-y-4 p-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-96 w-full' />
        </div>
      }
    >
      <MainCategoryTable />
    </Suspense>
  );
}
