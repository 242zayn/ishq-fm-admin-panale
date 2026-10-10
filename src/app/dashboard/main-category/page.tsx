import { Icons } from '@/components/icons';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import MainCategoryListingPage from '@/features/main-category/components/main-category-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Main Categories'
};

type PageProps = Readonly<{
  searchParams: Promise<SearchParams>;
}>;

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const AddIcon = Icons.add;

  return (
    <PageContainer
      pageTitle='Main Categories'
      pageDescription='Create and manage the main story categories.'
      pageHeaderAction={
        <Link
          href='/dashboard/main-category/new'
          className={cn(buttonVariants(), 'text-xs md:text-sm')}
        >
          <AddIcon className='mr-2 h-4 w-4' /> Add Main Category
        </Link>
      }
    >
      <MainCategoryListingPage />
    </PageContainer>
  );
}
