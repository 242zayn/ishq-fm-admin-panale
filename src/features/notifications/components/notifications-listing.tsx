import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsTable } from './notifications-table';

export default function NotificationsListingPage() {
  return (
    <Suspense
      fallback={
        <div className='space-y-4 p-4'>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-96 w-full' />
        </div>
      }
    >
      <NotificationsTable />
    </Suspense>
  );
}
