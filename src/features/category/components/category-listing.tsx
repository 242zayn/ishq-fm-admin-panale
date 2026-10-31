import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryTable } from './category-tables';

export default function CategoryListingPage() {
  return (
    <Suspense
      fallback={
        <div className='space-y-4 p-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-96 w-full' />
        </div>
      }
    >
      <CategoryTable />
    </Suspense>
  );
}
