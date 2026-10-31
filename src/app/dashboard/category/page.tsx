import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import CategoryListingPage from '@/features/category/components/category-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import type { SearchParams } from 'nuqs/server';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard: Categories'
};

type PageProps = Readonly<{
  searchParams: Promise<SearchParams>;
}>;

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Categories'
      pageDescription='Create and manage story categories.'
      pageHeaderAction={
        <Link href='/dashboard/category/new' className={cn(buttonVariants(), 'text-xs md:text-sm')}>
          <Icons.add className='mr-2 h-4 w-4' /> Add Category
        </Link>
      }
    >
      <CategoryListingPage />
    </PageContainer>
  );
}
